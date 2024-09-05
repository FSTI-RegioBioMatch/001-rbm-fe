import { Injectable } from '@angular/core';
import { PersonType } from '../types/person.type';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EmploymentType } from '../types/employment.type';
import { CompanyType } from '../types/company.type';
import { HttpClient } from '@angular/common/http';
import { OntofoodType } from '../types/ontofood.type';
import { OfferType } from '../types/offer.type';
import { PublicRecipeType } from '../types/public-recipe.type';
import { RecipeType } from '../types/recipe.type';

export type NearbuyRole =
  | 'SUPPLIER'
  | 'CONSUMER'
  | 'SHIPPER'
  | 'CONSOLIDATOR'
  | 'PROCESSOR'
  | 'WHOLESALER'
  | 'NETWORKER';
export type rbmRole = 'producer' | 'refiner' | 'gastro';

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

  private rbmRoleSubject = new BehaviorSubject<rbmRole>('gastro');
  public rbmRole$ = this.rbmRoleSubject.asObservable();

  // current user company context
  private selectedCompanyContext = new BehaviorSubject<CompanyType | null>(
    null,
  );
  public selectedCompanyContext$ = this.selectedCompanyContext.asObservable();

  // current selected recipes to great menu plan
  public selectedPublicRecipeSubject = new BehaviorSubject<PublicRecipeType[]>(
    [],
  );
  public selectedPublicRecipe$ =
    this.selectedPublicRecipeSubject.asObservable();

  public selectedRecipesSubject = new BehaviorSubject<RecipeType[]>([]);
  public selectedRecipes$ = this.selectedRecipesSubject.asObservable();

  public selectedCompanyLatLonSubject = new BehaviorSubject<{
    lat: number;
    lon: number;
  } | null>(null);

  public selectedCompanyLatLon$ =
    this.selectedCompanyLatLonSubject.asObservable();

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
    // Try to get the company context from local storage
    const companyContext = localStorage.getItem('company_context');

    if (companyContext) {
      console.info('Company context from session store:', companyContext);

      // Subscribe to the companies$ observable
      this.companies$.subscribe((companies) => {
        // Check if companies is defined and is an array
        if (Array.isArray(companies)) {
          // Try to find a company that matches the stored companyContext
          const company = companies.find((c) => c && c.id === companyContext);

          if (company) {
            // If found, set it as the selected company context
            this.selectedCompanyContext.next(company);
          } else {
            console.warn(`No company found with id: ${companyContext}`);
          }
        } else {
          console.warn('Companies data is not available or not an array');
        }
      });
    } else {
      // If companyContext is not in local storage
      console.info('No company context found in session store');

      // Subscribe to the companies$ observable
      this.companies$.subscribe((companies) => {
        // Check if companies is defined and is an array
        if (Array.isArray(companies) && companies.length > 0) {
          // Set the first company as the selected company context
          this.selectedCompanyContext.next(companies[0]);
        } else {
          console.warn('No companies available to select as default');
        }
      });
    }
  }

  private selectedCompanyContextChangedListener() {
    this.selectedCompanyContext$.subscribe((company) => {
      if (company) {
        localStorage.setItem('company_context', company.id);
        this.updaterbmRole(company.roles);
      }
    });
  }

  public updateSelectedCompanyContext(company: CompanyType) {
    console.info('Updating selected company context:', company);
    this.selectedCompanyContext.next(company);
    this.updaterbmRole(company.roles as NearbuyRole[]);
  }

  private updaterbmRole(roles: NearbuyRole[]) {
    if (Array.isArray(roles)) {
      const rbmRole = this.mapToRBMRole(roles);
      this.rbmRoleSubject.next(rbmRole);
    } else {
      console.warn('Roles is not an array or is undefined:', roles);
      this.rbmRoleSubject.next('gastro'); // Default if roles is invalid
    }
  }

  public mapToRBMRole(roles: NearbuyRole[]): rbmRole {
    //console.log('nearbuy role:', roles);

    if (!Array.isArray(roles)) {
      console.warn('Expected roles to be an array, received:', roles);
      return 'gastro'; // Return a default value if roles is invalid
    }

    // Use type guard to ensure roles are strings
    if (roles.includes('SUPPLIER')) {
      return 'producer';
    } else if (
      roles.some((role) =>
        ['SHIPPER', 'CONSOLIDATOR', 'PROCESSOR', 'WHOLESALER'].includes(role),
      )
    ) {
      return 'refiner';
    } else {
      return 'gastro'; // Default to gastro if no matching roles
    }
  }
}
