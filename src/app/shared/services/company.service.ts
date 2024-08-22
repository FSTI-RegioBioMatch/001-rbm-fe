import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CompanyType } from '../types/company.type';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AddressType } from '../types/address.type';
import { GeoService } from './geo.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private loadedSubject = new BehaviorSubject<boolean>(false);
  loaded$ = this.loadedSubject.asObservable();
  private companiesSubject = new BehaviorSubject<CompanyType[]>([]);
  companies$ = this.companiesSubject.asObservable();
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
  ) {}

  private getCompanies(dynamicParams: HttpParams): Observable<CompanyType[]> {
    let params = new HttpParams()
      .set('limit', '500')
      .set('showOnlyFavourites', 'false')
      .set('showOwnData', 'false')
      .set('format', 'SEARCH_RESULT');

    // Merge additional dynamic parameters
    dynamicParams.keys().forEach(key => {
      params = params.set(key, dynamicParams.get(key)!);
    });

    return this.http.get<CompanyType[]>(`${environment.NEARBUY_API}/companies`, { params });
  }

  setCompaniesBySearchCriteria(searchRadiusInKM: number, address: AddressType) {
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

    let params = new HttpParams()
      .set('lat1', boundingBox.latMin.toString())
      .set('lon1', boundingBox.lonMin.toString())
      .set('lat2', boundingBox.latMax.toString())
      .set('lon2', boundingBox.lonMax.toString());

    this.getCompanies(params).pipe(
      tap(companies => this.companiesSubject.next(companies)),
      finalize(() => this.loadedSubject.next(true))
    ).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Error fetching companies:', error);
        this.loadedSubject.next(true);
      }
    });
  }
  
  getCompaniesObservable(): Observable<CompanyType[]> {
    return this.companies$;
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
