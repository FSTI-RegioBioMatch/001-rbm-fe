import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShoppingListService } from '../../../shared/services/shopping-list.service';
import { ShoppingListType } from '../../../shared/types/shopping-list.type';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { StoreService } from '../../../shared/store/store.service';
import { RequestService } from '../../../shared/services/request.service';
import { OfferService } from '../../../shared/services/offer.service';
import { GeoService } from '../../../shared/services/geo.service';
import { NearbuyOfferService } from '../../../shared/services/offer/nearbuy-offer.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { OntofoodType } from '../../../shared/types/ontofood.type';
import { OfferType } from '../../../shared/types/offer.type';
import { OfferDetailedType } from '../../../shared/types/offer-detailed.type';
import { ProductType } from '../../../shared/types/product.type';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-offer-scan',
  standalone: true,
  imports: [Button, PrimeTemplate, TableModule, BadgeModule, DropdownModule],
  templateUrl: './offer-scan.component.html',
  styleUrls: ['./offer-scan.component.scss'],
})
export class OfferScanComponent implements OnInit {
  shoppingListId!: string;
  scanId!: string;
  shoppingList!: ShoppingListType;
  scanInProgress = true;
  private results: null | {
    companies: any[];
    latLon: { lat: number; lon: number };
  } = null;
  matchedProducts: ProductType[] = [];
  offerDetailed: OfferDetailedType[] = [];
  regionalityInKm = ['10', '20', '50', '100'];
  selectedCompanies: any[] = [];

  constructor(
    private router: ActivatedRoute,
    private shoppingListService: ShoppingListService,
    private store: StoreService,
    private requestService: RequestService,
    private offerService: OfferService,
    private geoService: GeoService,
    private nearbuyOfferService: NearbuyOfferService,
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.loadRouterParams();
  }

  private initializeData(): void {
    this.store.selectedCompanyLatLon$
      .pipe(switchMap((latLon) => this.handleLatLon(latLon)))
      .subscribe((results) => this.handleResults(results));
  }

  private handleLatLon(
    latLon: { lat: number; lon: number } | null,
  ): Observable<any> {
    if (!latLon) {
      return of(null);
    }
    //this.offerService.setOffersBySearchRadius(50, this.offerService.address);

    const { latMin, latMax, lonMin, lonMax } = this.geoService.getBoundingBox(
      20,
      latLon.lat,
      latLon.lon,
    );

    return this.nearbuyOfferService
      .getOffersByRadius(latMin, lonMin, latMax, lonMax)
      .pipe(switchMap((offers) => this.processOffers(offers, latLon)));
  }

  private processOffers(
    offers: OfferType[],
    latLon: { lat: number; lon: number },
  ): Observable<any> {
    const offerRequests = offers.map((offer) =>
      this.requestService
        .doGetRequest(offer.links.offer)
        .pipe(
          switchMap((offerResponse) =>
            this.processOfferResponse(offerResponse, offer),
          ),
        ),
    );

    return forkJoin(offerRequests).pipe(
      map((detailedOffers) =>
        this.groupOffersByCompany(detailedOffers, latLon),
      ),
    );
  }

  private processOfferResponse(
    offerResponse: any,
    offer: OfferType,
  ): Observable<any> {
    const offerDetailed = offerResponse as OfferDetailedType;
    this.offerDetailed.push(offerDetailed);

    return this.requestService.doGetRequest(offerDetailed.links.category).pipe(
      map((categoryResponse) => ({
        company: offer.company,
        product: {
          ...offer.product,
          category: categoryResponse as OntofoodType,
          offerDetail: offerDetailed,
        },
      })),
    );
  }

  private groupOffersByCompany(
    detailedOffers: any[],
    latLon: { lat: number; lon: number },
  ): any {
    const groupedByCompany = detailedOffers.reduce((acc, current) => {
      const { company, product } = current;
      if (!acc[company.id]) {
        acc[company.id] = { ...company, products: [] };
      }
      acc[company.id].products.push(product);
      return acc;
    }, {});

    return { latLon, companies: Object.values(groupedByCompany) };
  }

  private handleResults(results: any): void {
    this.results = results;
    this.compareWithShoppingList();

    this.shoppingList.ingredients.forEach((ingredient, index) => {
      this.selectedCompanies[index] = this.matchedIngredientCompanies(
        ingredient.name,
      );
    });

    this.scanInProgress = false;
  }

  private loadRouterParams(): void {
    this.router.params.subscribe((params) => {
      if (!params['id'] || !params['scanId']) {

      } else {
        this.scanId = params['scanId'];
        this.shoppingListId = params['id'];
        this.getShoppingList();
      }
    });
  }

  private compareWithShoppingList(): void {
    this.shoppingList.ingredients.forEach((ingredient) => {
      if (!this.results) return;
      this.results.companies.forEach((company) => {
        company.products.forEach((product: ProductType) => {
          if (product.category.label === ingredient.name) {
            this.matchedProducts.push(product);
          }
        });
      });
    });
  }

  compareWithMatchingProductsByName(
    ingredientName: string,
  ): ProductType | undefined {
    return this.matchedProducts.find(
      (product) => product.category.label === ingredientName,
    );
  }

  matchedIngredientCompanies(ingredientName: string): any[] {
    if (!this.results) return [];
    return this.results.companies.filter((company) =>
      company.products.some(
        (product: ProductType) => product.category.label === ingredientName,
      ),
    );
  }

  private getShoppingList(): void {
    this.shoppingListService
      .getShoppingListByCompanyIdAndId(this.shoppingListId)
      .subscribe((shoppingList) => (this.shoppingList = shoppingList));
  }

  companyProductPiecePriceByIndex(
    rowIndex: number,
    ingredientName: string,
  ): string {

    if (!this.selectedCompanies[rowIndex].products) return '';

    const offerDetail = this.selectedCompanies[rowIndex].products.find(
      (product: ProductType) => product.category.label === ingredientName,
    )?.offerDetail;


    return offerDetail?.pricePerUnit || '';
  }

  findCompanyProductPrice(rowIndex: number, label: string): string {
    if (!this.selectedCompanies[rowIndex].products) return '';
    const product = this.selectedCompanies[rowIndex].products.find(
      (product: ProductType) => product.category.label === label,
    );
    return product ? product.offerDetail.pricePerUnit : '';
  }

  onDropDownCompanyChange(event: any, rowIndex: number): void {
    this.selectedCompanies[rowIndex] = event.value;
  }
}
