import { Injectable } from '@angular/core';
import { PersonType } from '../types/person.type';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { EmploymentType } from '../types/employment.type';
import { CompanyType } from '../types/company.type';
import { HttpClient } from '@angular/common/http';
import { OntofoodType } from '../types/ontofood.type';
import { OfferType } from '../types/offer.type';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  // Loading
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  // Person
  private personSubject = new BehaviorSubject<PersonType | null>(null);
  public person$ = this.personSubject.asObservable();

  // OntoFood
  private offerOntoFoodSubject = new BehaviorSubject<OntofoodType[]>([]);
  public offerOntoFood$ = this.offerOntoFoodSubject.asObservable();

  // Offers
  private offersSubject = new BehaviorSubject<OfferType[]>([]);
  public offers$ = this.offersSubject.asObservable();

  // Employments
  private employmentsSubject = new BehaviorSubject<EmploymentType[]>([]);
  public employments$ = this.employmentsSubject.asObservable();

  // Companies
  private companiesSubject = new BehaviorSubject<CompanyType[]>([]);
  public companies$ = this.companiesSubject.asObservable();

  // current user company context
  private selectedCompanyContext = new BehaviorSubject<CompanyType | null>(
    null,
  );
  public selectedCompanyContext$ = this.selectedCompanyContext.asObservable();

  constructor(private http: HttpClient) {
    this.selectedCompanyContextChangedListener();
  }

  public setOfferOntoFood(offerOntoFood: OntofoodType[]) {
    this.offerOntoFoodSubject.next(offerOntoFood);
  }

  setOffers(offers: OfferType[]) {
    this.offersSubject.next(offers);
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
        this.getSelectedCompanyFromSessionStore();
        this.employmentsSubject.next(employments);
        this.companiesSubject.next(companies);

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

  private getSelectedCompanyFromSessionStore() {
    const companyContext = localStorage.getItem('company_context');
    if (companyContext) {
      console.info('Company context from session store:', companyContext);

      this.companies$.subscribe((companies) => {
        const company = companies.find((c) => c.id === companyContext);
        if (company) {
          this.selectedCompanyContext.next(company);
        }
      });
      // this.selectedCompanyContext.next(companyContext);
    } else {
      this.companies$.subscribe((companies) => {
        if (companies.length > 0) {
          this.selectedCompanyContext.next(companies[0]);
        }
      });
    }
  }

  private selectedCompanyContextChangedListener() {
    this.selectedCompanyContext$.subscribe((company) => {
      if (company) {
        // this.companiesSubject.next([company]);
        localStorage.setItem('company_context', company.id);
      }
    });
  }

  public updateSelectedCompanyContext(company: CompanyType) {
    console.info('Updating selected company context:', company);
    this.selectedCompanyContext.next(company);
  }
}
