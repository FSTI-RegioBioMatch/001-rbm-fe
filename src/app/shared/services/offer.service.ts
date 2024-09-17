import { BehaviorSubject, finalize, forkJoin, Observable, switchMap, tap, of } from "rxjs";
import { AddressType } from "../types/address.type";
import { OfferType } from "../types/offer.type";
import { OntofoodType } from "../types/ontofood.type";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { GeoService } from "./geo.service";
import { StoreService } from "../store/store.service";
import { Injectable } from "@angular/core";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  constructor(
    private http: HttpClient,
    private geoService: GeoService,
    public store: StoreService,
  ) {}

  private loadedSubject = new BehaviorSubject<boolean>(false);
  loaded$ = this.loadedSubject.asObservable();

  private ontoFoodTypes: OntofoodType[] = [];
  public displayedFoodTypes: OntofoodType[] = [];

  // Create BehaviorSubject for the address
  private addressSubject = new BehaviorSubject<AddressType | null>(null);
  address$ = this.addressSubject.asObservable();

  private offersSubject = new BehaviorSubject<OfferType[]>([]);
  offers$ = this.offersSubject.asObservable();

  // Cache for offers based on address and search radius
  private offerCache = new Map<string, OfferType[]>();

  // Use BehaviorSubject to store and emit address
  setAddress(address: AddressType) {
    this.addressSubject.next(address);
  }

  // Method to get the current value of the address
  get address(): AddressType | null {
    return this.addressSubject.value;
  }

  private getOffers(
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number,
  ): Observable<OfferType[]> {
    const cacheKey = `${lon1}-${lat1}-${lon2}-${lat2}`;
    if (this.offerCache.has(cacheKey)) {
      return of(this.offerCache.get(cacheKey)!);
    }

    console.log('Fetching offers from API', lon1, lat1, lon2, lat2);
    return this.http.get<OfferType[]>(
      `${environment.NEARBUY_API}/offers?limit=1000&lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`
    ).pipe(
      tap((offers) => this.offerCache.set(cacheKey, offers))
    );
  }

  setOffersBySearchRadius(searchRadiusInKM: number, address: AddressType) {
    if (!address) {
      console.error('Address is not provided');
      return;
    }

    this.setAddress(address); // Set the address via the BehaviorSubject
    this.loadedSubject.next(false);

    const boundingBox = this.geoService.getBoundingBox(
      searchRadiusInKM,
      address.lat,
      address.lon,
    );

    const cacheKey = `${boundingBox.lonMin}-${boundingBox.latMin}-${boundingBox.lonMax}-${boundingBox.latMax}`;

    if (this.offerCache.has(cacheKey)) {
      // Use cached data if available
      this.offersSubject.next(this.offerCache.get(cacheKey)!);
      this.loadedSubject.next(true);
      return;
    }

    console.log("before getOffers");

    this.getOffers(
      boundingBox.lonMin,
      boundingBox.latMin,
      boundingBox.lonMax,
      boundingBox.latMax,
    )
      .pipe(
        debounceTime(300), // Debounce to prevent spamming
        distinctUntilChanged(), // Ensure only distinct requests
        tap((offers) => this.store.setOffers(offers)),
        switchMap((offers: OfferType[]) => {
          const observables = offers.map((offer) =>
            forkJoin({
              ontoFoodType: this.http.get<OntofoodType>(offer.links.category),
              offerDetails: this.http.get<any>(offer.links.offer),
            })
          );

          return forkJoin(observables).pipe(
            tap((responses) => {
              this.ontoFoodTypes = [];

              responses.forEach((response, index) => {
                const { ontoFoodType, offerDetails } = response;

                if (!this.ontoFoodTypes.some((type) => type.label === ontoFoodType.label)) {
                  this.ontoFoodTypes.push(ontoFoodType);
                }

                offers[index].ontoFoodType = ontoFoodType;
                offers[index].offerDetails = offerDetails;
              });

              this.displayedFoodTypes = this.ontoFoodTypes.slice(0, 5);
              this.store.setOfferOntoFood(this.displayedFoodTypes);

              this.offersSubject.next(offers);
              // Cache the offers after processing
              this.offerCache.set(cacheKey, offers);
            })
          );
        }),
        finalize(() => this.loadedSubject.next(true)),
      )
      .subscribe({
        next: () => {},
        error: (error) => {
          console.error('Error fetching offers:', error);
          this.loadedSubject.next(true);
        },
      });
  }

  getOffersObservable(): Observable<OfferType[]> {
    return this.store.offers$;
  }

  get loaded(): boolean {
    return this.loadedSubject.value;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getAddress(addressUrl: string): Observable<AddressType> {
    return this.http.get<AddressType>(addressUrl);
  }

  getOrders(): Observable<any> {
    return this.http.get<any>(`${environment.NEARBUY_API}/orders`);
  }

  getRecurringOrders(): Observable<any> {
    return this.http.get<any>(`${environment.NEARBUY_API}/recurring_orders`);
  }

  getPriceRequests(): Observable<any> {
    return this.http.get<any>(`${environment.NEARBUY_API}/price_requests`);
  }

  getLevelsOfProcessing(): Observable<any> {
    return this.http.get<any>(`${environment.NEARBUY_API}/levels_of_processing`);
  }

  getPurchaseIntents(): Observable<any> {
    return this.http.get<any>(`${environment.NEARBUY_API}/purchase_intents`);
  }
}
