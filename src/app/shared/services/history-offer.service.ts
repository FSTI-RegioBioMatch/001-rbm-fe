import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { tap, finalize, switchMap  } from 'rxjs/operators';
import { StoreService } from '../store/store.service';
import { GeoService } from './geo.service';
import { OntofoodType } from '../types/ontofood.type';
import { AddressType } from '../types/address.type';
import { HistoricProductType } from '../types/historicproduct.type';


@Injectable({
    providedIn: 'root',
  })
  export class HistoryOfferService{
    private loadedSubject = new BehaviorSubject<boolean>(false);
    loaded$ = this.loadedSubject.asObservable();
    private productsSubject = new BehaviorSubject<HistoricProductType[]>([]);
    products$ = this.productsSubject.asObservable();
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

    constructor(
        private http: HttpClient,
        private geoService: GeoService,
        public store: StoreService,) {}

        private getProducts(dynamicParams: HttpParams): Observable<HistoricProductType[]> {
          let params = new HttpParams()
            .set('limit', '500')
            .set('showOnlyFavourites', 'false')
            .set('showOwnData', 'false')
            .set('includeDeactivated', 'true')
            .set('format', 'SEARCH_RESULT');
      
          // Merge additional dynamic parameters
          dynamicParams.keys().forEach(key => {
            params = params.set(key, dynamicParams.get(key)!);
          });
      
          return this.http.get<HistoricProductType[]>(`${environment.NEARBUY_API}/offers`, { params });
      }
    
    getProductsObservable(): Observable<HistoricProductType[]> {
        return this.products$;
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
      
    setProductsBySearchCriteria(searchRadiusInKM: number, address: AddressType) {
        this.loadedSubject.next(false);
        console.log("lat: & lon:", address.lat, address.lon)

        // Calculate the bounding box using GeoService
        const boundingBox = this.geoService.getBoundingBox(
          searchRadiusInKM,
          address.lat,
          address.lon
        );
      
        let params = new HttpParams()
          .set('lat1', boundingBox.latMin.toString())
          .set('lon1', boundingBox.lonMin.toString())
          .set('lat2', boundingBox.latMax.toString())
          .set('lon2', boundingBox.lonMax.toString());
      
        this.getProducts(params).pipe(
          tap((products: HistoricProductType[]) => {
            this.productsSubject.next(products);
            return products;
          }),
          switchMap((products: HistoricProductType[]) => {
            // Create observables for fetching OntofoodType details
            const observables = products.map(product =>
              this.http.get<OntofoodType>(product.links.category)
            );
            // Wait for all OntofoodType requests to complete
            return forkJoin(observables);
          }),
          tap((ontoFoodTypesResponses: OntofoodType[]) => {
            this.ontoFoodTypes = [];
            ontoFoodTypesResponses.forEach((ontoFoodType, index) => {
              // Push unique ontoFoodType instances
              if (!this.ontoFoodTypes.some(type => type.label === ontoFoodType.label)) {
                this.ontoFoodTypes.push(ontoFoodType);
              }
              // Attach OntofoodType to respective product
              const product = this.productsSubject.getValue()[index];
              product.ontoFoodType = ontoFoodType;
            });
            // Set ontoFoodTypes in store
            this.store.setOfferOntoFood(this.ontoFoodTypes);
          }),
          finalize(() => this.loadedSubject.next(true))
        ).subscribe({
          next: () => {},
          error: (error) => {
            console.error('Error fetching OntofoodType details:', error);
            this.loadedSubject.next(true);
          }
        });
      }
  }
  