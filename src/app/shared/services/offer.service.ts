import { BehaviorSubject, finalize, forkJoin, Observable, switchMap, tap, of, ObservedValuesFromArray } from "rxjs";
import { AddressType } from "../types/address.type";
import { OfferType } from "../types/offer.type";
import { OntofoodType } from "../types/ontofood.type";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { GeoService } from "./geo.service";
import { StoreService } from "../store/store.service";
import { Injectable } from "@angular/core";
import { catchError, debounceTime, distinctUntilChanged } from "rxjs/operators";

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

  // Cache for offers with a 1-hour TTL
  private cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds
  private offerCache = new Map<string, { data: OfferType[], timestamp: number }>();
  private inFlightRequests = new Map<string, Observable<OfferType[]>>();
  // Use BehaviorSubject to store and emit address
  setAddress(address: AddressType) {
    this.addressSubject.next(address);
  }

  // Method to get the current value of the address
  get address(): AddressType | null {
    return this.addressSubject.value;
  }

  // Method to generate a unique cache key based on address coordinates (not radius)
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

    // Check if cache is valid (not expired)
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      console.log('Using cached offers');
      return of(cached.data);
    }

    // Check if the same request is already in-flight
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!;
    }

    console.log('Fetching offers from API', lon1, lat1, lon2, lat2);

    const request$ = this.http.get<OfferType[]>(
      `${environment.NEARBUY_API}/offers?limit=1000&lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`
    ).pipe(
      tap((offers) => {
        // Cache the fetched offers with a timestamp
        this.offerCache.set(cacheKey, { data: offers, timestamp: Date.now() });
        this.inFlightRequests.delete(cacheKey); // Remove from in-flight requests after completion
      }),
      finalize(() => {
        this.inFlightRequests.delete(cacheKey); // Ensure cleanup on error/finalization
      })
    );

    // Store the in-flight request to prevent duplicates
    this.inFlightRequests.set(cacheKey, request$);

    return request$;
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

    const cacheKey = this.generateCacheKey(address);

    // Delay and debounce the offer fetching logic to avoid spamming requests
    this.getOffers(
      boundingBox.lonMin,
      boundingBox.latMin,
      boundingBox.lonMax,
      boundingBox.latMax,
      cacheKey
    ).pipe(
      debounceTime(500), // Debounce to prevent rapid successive calls
      distinctUntilChanged(), // Only proceed with distinct changes
      switchMap((offers: OfferType[]) => {
        const observables = offers.map((offer) => 
          // Fetch ontoFoodType and offerDetails for each offer in parallel
          forkJoin({
            ontoFoodType: this.http.get<OntofoodType>(offer.links.category).pipe(
              catchError((error) => {
                console.error(`Failed to load ontoFoodType for offer ${offer}:`, error);
                return of(null); // Return null if this specific request fails
              })
            ),
            offerDetails: this.http.get<any>(offer.links.offer).pipe(
              catchError((error) => {
                console.error(`Failed to load offerDetails for offer ${offer}:`, error);
                return of(null); // Return null if this specific request fails
              })
            )
          }).pipe(
            tap(({ ontoFoodType, offerDetails }) => {
              // If both ontoFoodType and offerDetails are successfully fetched, update the offer
              if (ontoFoodType && offerDetails) {
                offer.ontoFoodType = ontoFoodType;
                offer.offerDetails = offerDetails;
              } else {
                console.warn(`Skipping offer ${offer} due to missing data.`);
              }
            })
          )
        );

        return forkJoin(observables).pipe(
          tap(() => {
            // Filter out any offers that didn't get their details
            const validOffers = offers.filter(offer => offer.ontoFoodType && offer.offerDetails);
            this.ontoFoodTypes = Array.from(
              new Set(validOffers.map(offer => offer.ontoFoodType).filter((ontoFoodType): ontoFoodType is OntofoodType => !!ontoFoodType))
            ).slice(0, 5);            

            this.store.setOfferOntoFood(this.ontoFoodTypes);
            this.offersSubject.next(validOffers); // Update with valid offers only
          })
        );
      }),
      finalize(() => this.loadedSubject.next(true))
    ).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Error fetching offers:', error);
        this.loadedSubject.next(true);
      }
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

  getLocalizedLoP(): Observable<any> {
    return this.http.get<any>(`https://api.locize.app/ad439f20-6ec0-41f8-af94-ebd3cf1b9b90/latest/de/levelsOfProcessing`)
  }

  getPurchaseIntents(): Observable<any> {
    return this.http.get<any>(`${environment.NEARBUY_API}/purchase_intents`);
  }
  
  clearOfferCache() {
    this.offerCache.clear(); // Clear the cache
    console.log('Offer cache cleared');
  }

    // Fetch individual price request details
    getPriceRequestDetails(url: string): Observable<any> {
      return this.http.get<any>(url);
    }
  
    // Fetch individual purchase intent details
    getPurchaseIntentDetails(url: string): Observable<any> {
      return this.http.get<any>(url);
    }
      // Fetch related detail (for company, person, offer, etc.)
  getRelatedDetail(url: string): Observable<any> {
    return this.http.get<any>(url);
  }
}
