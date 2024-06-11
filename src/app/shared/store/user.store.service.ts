import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, tap } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { PersonType } from '../types/person.type';
import { EmploymentType } from '../types/employment.type';
import { CompanyType } from '../types/company.type';
import { CompanyStoreService } from './company.store.service';
import { EmploymentsStoreService } from './employments.store.service';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  // Loading
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  // Person
  private personSubject = new BehaviorSubject<PersonType | null>(null);
  public person$ = this.personSubject.asObservable();

  constructor(
    private http: HttpClient,
    private companyStoreService: CompanyStoreService,
    private employmentsStoreService: EmploymentsStoreService,
  ) {}

  getPerson(): Observable<PersonType | null> {
    return this.person$;
  }

  initPersonMeInformation() {
    this.fetchPerson()
      .pipe(
        switchMap((person) => {
          this.personSubject.next(person);
          return forkJoin({
            employments: this.fetchEmployments(person),
            companies: this.fetchCompanies(person),
          });
        }),
        catchError((error) => {
          console.error('Error fetching person information:', error);
          return [];
        }),
        finalize(() => this.loadingSubject.next(false)),
      )
      .subscribe(({ employments, companies }) => {
        this.employmentsStoreService.employmentsSubject.next(employments);
        this.companyStoreService.companiesSubject.next(companies);

        companies.map((company) => {
          this.fetchCompanyAddresses(company);
        });
      });
  }

  // Fetch person information
  private fetchPerson(): Observable<PersonType> {
    return this.http.get<PersonType>(`${environment.NEARBUY_API}/persons/me`);
  }

  // Fetch employments for a person
  private fetchEmployments(person: PersonType): Observable<EmploymentType[]> {
    return this.http.get<EmploymentType[]>(`${person.links.self}/employments`);
  }

  // Fetch companies for a person's employments
  private fetchCompanies(person: PersonType): Observable<CompanyType[]> {
    return this.fetchEmployments(person).pipe(
      switchMap((employments) =>
        forkJoin(
          employments.map((employment) => {
            return this.http.get<CompanyType>(employment.links.company);
          }),
        ),
      ),
    );
  }

  private fetchCompanyAddresses(company: CompanyType): Observable<CompanyType> {
    return this.http.get<CompanyType>(`${company.links.self}/addresses`);
  }
}
