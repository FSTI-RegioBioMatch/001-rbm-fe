import { finalize, forkJoin, Observable, switchMap, tap, of } from "rxjs";
import { AddressType } from "../types/address.type";
import { OfferType } from "../types/offer.type";
import { OntofoodType } from "../types/ontofood.type";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { GeoService } from "./geo.service";
import { StoreService } from "../store/store.service";
import { Injectable } from "@angular/core";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class NewOfferService {
  private loaded = false;
  private ontoFoodTypes: OntofoodType[] = [];
  public displayedFoodTypes: OntofoodType[] = [];

  private address: AddressType | null = null;
  private offers: OfferType[] = [];

  // Cache for offers with a 1-hour TTL
  private cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds
  private offerCache = new Map<string, { 
    data: OfferType[], 
    timestamp: number, 
    boundingBox: { latMin: number, latMax: number, lonMin: number, lonMax: number } 
  }>();

  constructor(
    private http: HttpClient,
    private geoService: GeoService,
    public store: StoreService,
  ) {}

  setAddress(address: AddressType) {
    this.address = address;
  }

  getAddress(): AddressType | null {
    return this.address;
  }

  private generateCacheKey(address: AddressType): string {
    return `${address.lat}-${address.lon}`;
  }

  private getOffers(
    lon1: number,
    lat1: number,
    lon2: number,
    lat2: number,
    cacheKey: string
  ): Observable<OfferType[]> {
    const cached = this.offerCache.get(cacheKey);
  
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      // Refetch if the bounding boxes are different (regardless of size)
      if (this.isNewBoundingBoxDifferent(cached.boundingBox, { lon1, lat1, lon2, lat2 })) {
        console.log('Bounding box has changed, refetching...');
        this.offerCache.delete(cacheKey);
      } else {
        console.log('Using cached offers');
        return of(cached.data);
      }
    }
  
    console.log('Fetching offers from API', lon1, lat1, lon2, lat2);
    return this.http.get<OfferType[]>(
      `${environment.NEARBUY_API}/offers?limit=1000&lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`
    ).pipe(
      tap((offers) => {
        // Cache the new data along with the bounding box
        this.offerCache.set(cacheKey, { 
          data: offers, 
          timestamp: Date.now(), 
          boundingBox: { 
            lonMin: lon1,  // Correct value
            latMin: lat1,  // Correct value
            lonMax: lon2,  // Correct value
            latMax: lat2   // Correct value
          } 
        });
      })
    );
  }
  
  
  private isNewBoundingBoxDifferent(oldBox: any, newBox: any, tolerance: number = 0.00001): boolean {
    // Return true if the bounding box is different by more than the tolerance
    return (
      Math.abs(oldBox.latMin - newBox.latMin) > tolerance ||
      Math.abs(oldBox.latMax - newBox.latMax) > tolerance ||
      Math.abs(oldBox.lonMin - newBox.lonMin) > tolerance ||
      Math.abs(oldBox.lonMax - newBox.lonMax) > tolerance
    );
  }
  
  setOffersBySearchRadius(searchRadiusInKM: number, address: AddressType): Observable<OfferType[]> {
    if (!address) {
      console.error('Address is not provided');
      return of([]);  // Return empty observable if no address
    }
  
    this.setAddress(address);
    this.loaded = false;
  
    // Get the bounding box from the geoService
    const boundingBox = this.geoService.getBoundingBox(
      searchRadiusInKM,
      address.lat,
      address.lon
    );
  
    // Extract the bounding box values explicitly
    const { lonMin, latMin, lonMax, latMax } = boundingBox;
  
    const cacheKey = this.generateCacheKey(address);
  
    return this.getOffers(
      lonMin,  // Correct usage after extracting values
      latMin,  // Correct usage after extracting values
      lonMax,  // Correct usage after extracting values
      latMax,  // Correct usage after extracting values
      cacheKey
    ).pipe(
      debounceTime(300),
      distinctUntilChanged(),
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
  
            this.offers = offers;
          }),
          finalize(() => this.loaded = true),
          map(() => offers)  // Return the fully processed offers
        );
      })
    );
  }
  
  

  getOffersObservable(): Observable<OfferType[]> {
    return this.store.offers$;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getAddressFromUrl(addressUrl: string): Observable<AddressType> {
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
  
  clearOfferCache() {
    this.offerCache.clear();
    console.log('Offer cache cleared');
  }
}