import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMap, forkJoin, map, of, Observable } from 'rxjs';
import { OfferService } from '../shared/services/offer.service';
import { NewShoppingListService } from '../shared/services/new-shopping-list.service';
import { StoreService } from '../shared/store/store.service';
import { GeoService } from '../shared/services/geo.service';
import { NearbuyOfferService } from '../shared/services/offer/nearbuy-offer.service';
import { RequestService } from '../shared/services/request.service';
import { ProductType } from '../shared/types/product.type';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-new-offer-scan',
  standalone: true,
  imports: [TableModule, BadgeModule, CommonModule, ReactiveFormsModule, DropdownModule],
  templateUrl: './new-offer-scan.component.html',
  styleUrls: ['./new-offer-scan.component.scss'],
})
export class NewOfferScanComponent implements OnInit {
  shoppingListId!: string;
  scanId!: string;
  shoppingList: any;
  scanInProgress = true;
  private results: null | { companies: any[]; latLon: { lat: number; lon: number } } = null;
  matchedProducts: ProductType[] = [];
  selectedCompanies: any[] = [];
  regionalityInKm = ['10', '20', '50', '100'];
  offerDetailed: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private offerService: OfferService,
    private shoppingListService: NewShoppingListService,
    private storeService: StoreService,
    private geoService: GeoService,
    private nearbuyOfferService: NearbuyOfferService,
    private requestService: RequestService
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.loadRouterParams();
  }

  private initializeData(): void {
    this.storeService.selectedCompanyLatLon$
      .pipe(switchMap((latLon) => this.handleLatLon(latLon)))
      .subscribe((results) => this.handleResults(results));
  }

  private handleLatLon(latLon: { lat: number; lon: number } | null): Observable<any> {
    if (!latLon) {
      return of(null);
    }

    // Check if address is set before fetching offers
    const address = this.offerService.address;
    if (address) {
      this.offerService.setOffersBySearchRadius(50, address);
    } else {
      // Wait for the address to be set asynchronously
      this.offerService.address$.subscribe(address => {
        if (address) {
          this.offerService.setOffersBySearchRadius(50, address);
        }
      });
    }

    const { latMin, latMax, lonMin, lonMax } = this.geoService.getBoundingBox(20, latLon.lat, latLon.lon);

    return this.nearbuyOfferService
      .getOffersByRadius(latMin, lonMin, latMax, lonMax)
      .pipe(switchMap((offers) => this.processOffers(offers, latLon)));
  }

  private processOffers(offers: any[], latLon: { lat: number; lon: number }): Observable<any> {
    const offerRequests = offers.map((offer) =>
      this.requestService
        .doGetRequest(offer.links.offer)
        .pipe(switchMap((offerResponse) => this.processOfferResponse(offerResponse, offer)))
    );

    return forkJoin(offerRequests).pipe(map((detailedOffers) => this.groupOffersByCompany(detailedOffers, latLon)));
  }

  private processOfferResponse(offerResponse: any, offer: any): Observable<any> {
    const offerDetailed = offerResponse;
    this.offerDetailed.push(offerDetailed);

    return this.requestService.doGetRequest(offerDetailed.links.category).pipe(
      map((categoryResponse) => ({
        company: offer.company,
        product: {
          ...offer.product,
          category: categoryResponse,
          offerDetail: offerDetailed,
        },
      }))
    );
  }

  private groupOffersByCompany(detailedOffers: any[], latLon: { lat: number; lon: number }): any {
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

    if (this.shoppingList && Array.isArray(this.shoppingList.ingredients) && this.shoppingList.ingredients.length > 0) {
      this.compareWithShoppingList(this.shoppingList.ingredients);

      this.shoppingList.ingredients.forEach((ingredient: any, index: number) => {
        this.selectedCompanies[index] = this.matchedIngredientCompanies(ingredient.name);
      });

      this.scanInProgress = false;
    } else {
      console.error('Shopping list or ingredients are not defined or empty.');
    }
  }

  private loadRouterParams(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (!params['id'] || !params['scanId']) {
        console.error('No ID or scan ID provided');
      } else {
        this.scanId = params['scanId'];
        this.shoppingListId = params['id'];
        this.getShoppingList();
      }
    });
  }

  private compareWithShoppingList(ingredients: any[]): void {
    if (!this.results || !this.results.companies) {
      console.error('Results or companies are not defined.');
      return;
    }

    ingredients.forEach((ingredient) => {
      this.results?.companies.forEach((company) => {
        company.products.forEach((product: ProductType) => {
          const ingredientName = ingredient.name.toLowerCase();
          const productCategory = product.category.label.toLowerCase();

          // Exact or partial match
          if (this.isMatchingProduct(ingredientName, productCategory)) {
            this.matchedProducts.push({
              ...product,
              company: company.name, // Adding company name for easier debugging and display
            });
          }
        });
      });
    });
  }

  private isMatchingProduct(ingredientName: string, productCategory: string): boolean {
    // Exact match
    if (ingredientName === productCategory) {
      return true;
    }

    // Partial match (e.g., 'paprika' matches 'red paprika')
    if (productCategory.includes(ingredientName)) {
      return true;
    }

    return false;
  }

  private getShoppingList(): void {
    this.storeService.selectedCompanyContext$
      .pipe(
        filter((company) => company !== null),
        switchMap(() => this.shoppingListService.getShoppingListById(this.shoppingListId))
      )
      .subscribe({
        next: (shoppingList) => {
          this.shoppingList = shoppingList;
          this.shoppingList.ingredients = this.extractIngredientsFromGroupedList(this.shoppingList.groupedShoppingList);
        },
        error: (error) => {
          console.error('Error fetching shopping list:', error);
        },
      });
  }

  private extractIngredientsFromGroupedList(groupedShoppingList: any): any[] {
    if (!groupedShoppingList) {
      return [];
    }

    return Object.values(groupedShoppingList)
      .flat()
      .map((ingredient: any) => ({
        name: ingredient.name.toLowerCase(),
        unit: ingredient.unit,
        totalAmount: ingredient.totalAmount,
        sourceRecipes: ingredient.sourceRecipes,
        category: ingredient.category,
        processingBreakdown: ingredient.processingBreakdown,
        convertible: ingredient.convertible,
      }));
  }

  matchedIngredientCompanies(ingredientName: string): any[] {
    if (!this.results || !this.results.companies) {
      return [];
    }
    return this.results.companies
      .filter((company) =>
        company.products.some((product: ProductType) => product.category.label.toLowerCase() === ingredientName.toLowerCase())
      )
      .map((company) => ({
        label: company.name,
        value: company,
      }));
  }

  findCompanyProductPrice(rowIndex: number, label: string): string {
    const product = this.selectedCompanies[rowIndex]?.products?.find(
      (product: ProductType) => product.category.label.toLowerCase() === label.toLowerCase()
    );
    return product ? product.offerDetail.pricePerUnit : '';
  }

  parseFloat(value: any): number {
    return parseFloat(value);
  }

  onDropDownCompanyChange(event: any, rowIndex: number): void {
    this.selectedCompanies[rowIndex] = event.value;
  }
}
