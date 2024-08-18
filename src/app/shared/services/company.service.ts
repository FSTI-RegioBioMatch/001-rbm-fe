import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CompanyType } from '../types/company.type';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private loadedSubject = new BehaviorSubject<boolean>(false);
  loaded$ = this.loadedSubject.asObservable();
  private companiesSubject = new BehaviorSubject<CompanyType[]>([]);
  companies$ = this.companiesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getCompanies(dynamicParams: HttpParams): Observable<CompanyType[]> {
    console.log('start search');
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

  setCompaniesBySearchCriteria(searchCriteria: any) {
    this.loadedSubject.next(false);

    let params = new HttpParams();

    Object.keys(searchCriteria).forEach(key => {
      if (searchCriteria[key]) {
        params = params.set(key, searchCriteria[key]);
      }
    });

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
    console.log('companies received from API:', this.companiesSubject);
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
}
