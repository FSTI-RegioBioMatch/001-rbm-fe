import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { OfferType } from '../types/offer.type';
import { OntofoodType } from '../types/ontofood.type';
import { forkJoin } from 'rxjs';
import { RequestService } from './request.service';
import { GeoService } from './geo.service';
import { AddressType } from '../types/address.type';
import { StoreService } from '../store/store.service';
import { map } from 'rxjs/operators';
import { tap, switchMap, finalize} from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

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
  public address: AddressType = {
    id: '',
    city: '',
    lat: 0,
    lon: 0,
    street: '',
    name: '',
    suffix: '',
    zipcode: '',
    type: '',
    links: {
      self: '',
      update: '',
      remove: '',
      company: ''
    }
  };
  private offersSubject = new BehaviorSubject<OfferType[]>([]);
  offers$ = this.offersSubject.asObservable();

  private getOffers(lon1: number, lat1: number, lon2: number, lat2: number) :
    Observable<OfferType[]> {
    return this.http.get<OfferType[]>(
      `${environment.NEARBUY_API}/offers?limit=1000&lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&companyName=&showOnlyFavourites=false&showOwnData=false&format=SEARCH_RESULT`,
    );
  }

  setOffersBySearchRadius(searchRadiusInKM: number, address: AddressType) {
    if (!address) {
      console.error('Address is not provided');
      return;
    }

    this.address = address;
    this.loadedSubject.next(false);

    const boundingBox = this.geoService.getBoundingBox(
      searchRadiusInKM,
      address.lat,
      address.lon,
    );
    
    this.getOffers(
      boundingBox.lonMin,
      boundingBox.latMin,
      boundingBox.lonMax,
      boundingBox.latMax,
    ).pipe(
      tap(offers => this.store.setOffers(offers)),
      switchMap((offers: OfferType[]) => {
      const observables = offers.map((offer) =>
        this.http.get<OntofoodType>(offer.links.category)
      );

      return forkJoin(observables).pipe(
        tap((responses: OntofoodType[]) => {
          this.ontoFoodTypes = [];
          responses.forEach((response, index) => {
            const ontoFoodType = response;
            // Only push if label does not exist in ontoFoodTypes
            if (!this.ontoFoodTypes.some(
                (type) => type.label === ontoFoodType.label,
              )
            ) {this.ontoFoodTypes.push(ontoFoodType);
            }
            // Attach additional data to the offer
            offers[index].ontoFoodType = ontoFoodType;
          });
          this.displayedFoodTypes = this.ontoFoodTypes.slice(0, 5);
          this.store.setOfferOntoFood(this.displayedFoodTypes);
          this.offersSubject.next(offers);
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
    return item.id || index; // Use item.id if available, otherwise use the index
  }

  getAddress(addressUrl: string): Observable<AddressType> {
    return this.http.get<AddressType>(addressUrl);
  }

}
