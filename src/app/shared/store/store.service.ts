import { Injectable } from '@angular/core';
import { PersonType } from '../types/person.type';
import { BehaviorSubject, forkJoin, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  finalize,
  switchMap,
  filter,
  take,
  map,
} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EmploymentType } from '../types/employment.type';
import { CompanyType } from '../types/company.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OntofoodType } from '../types/ontofood.type';
import { OfferType } from '../types/offer.type';
import { PublicRecipeType } from '../types/public-recipe.type';
import { RecipeType } from '../types/recipe.type';
import { UserProfile } from '../types/userprofile.type';

export type NearbuyRole =
  | 'SUPPLIER'
  | 'PROCESSOR'
  | 'CONSOLIDATOR'
  | 'SHIPPER'
  | 'WHOLESALER'
  | 'PRODUCER'
  | 'GASTRO';

export type rbmRole = 'refiner' | 'producer' | 'supplier' | 'gastro';

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

  // current selected recipes to create menu plan
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
  private backendUrl = `${environment.API_CORE}/user-profiles`;

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
          console.log('[Store] Fetched person:', person);
          this.personSubject.next(person);
          return forkJoin({
            employments: this.fetchEmployments(person),
            companies: this.fetchCompanies(person),
          }).pipe(
            map(({ employments, companies }) => ({
              person,
              employments,
              companies,
            })),
          );
        }),
        catchError((error) => {
          console.error('[Store] Error fetching person information:', error);
          return [];
        }),
        finalize(() => {
          console.log('[Store] Loading finished');
          this.loadingSubject.next(false);
        }),
      )
      .subscribe(({ person, employments, companies }) => {
        console.log('[Store] Data loaded:', {
          employments: employments.length,
          companies: companies.length,
        });
        this.sendUserProfile(person, employments, companies);
        this.employmentsSubject.next(employments);
        this.companiesSubject.next(companies);

        // Log companies data
        console.log('[Store] Companies data:', companies);

        // When updating companies, also fetch and set offers
        this.fetchAndSetOffers(companies);

        // Only trigger company context selection once companies are fully loaded
        this.getSelectedCompanyFromSessionStore();

        companies.map((company) => {
          this.fetchCompanyAddresses(company).subscribe((company) => {
            console.log('[Store] Fetched company addresses:', company);
          });
        });
      });
  }

  sendUserProfile(
    person: PersonType,
    employments: EmploymentType[],
    companies: CompanyType[],
  ) {
    // Extract company IDs
    const companyIds = companies.map((company) => company.id);

    // Create the user profile object
    const userProfile: UserProfile = {
      person,
      employments,
      companies,
      companyIds,
    };

    // Log the user profile for debugging
    console.log('Sending user profile:', userProfile);

    // Send the merged object to the backend
    this.saveOrUpdateUserProfile(userProfile).subscribe({
      next: (response) => {
        console.log('User profile saved:', response);
      },
      error: (error) => {
        console.error('Error saving user profile:', error);
      },
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
      switchMap((employments) => {
        console.log(123123, employments);
        return forkJoin(
          employments.map((employment) => {
            return this.http.get<CompanyType>(employment.links.company);
          }),
        );
      }),
    );
  }

  private fetchCompanyAddresses(company: CompanyType): Observable<CompanyType> {
    return this.http.get<CompanyType>(`${company.links.self}/addresses`);
  }

  private getSelectedCompanyFromSessionStore() {
    const companyContext = localStorage.getItem('company_context');

    if (companyContext) {
      console.info('Company context from session store:', companyContext);

      // Wait for the companies to load before selecting a company context
      this.companies$
        .pipe(
          filter(
            (companies) => Array.isArray(companies) && companies.length > 0,
          ),
          take(1),
        )
        .subscribe((companies) => {
          const company = companies.find((c) => c && c.id === companyContext);
          if (company) {
            this.selectedCompanyContext.next(company);
          } else {
            console.warn(`No company found with id: ${companyContext}`);
          }
        });
    } else {
      console.info('No company context found in session store');

      this.companies$
        .pipe(
          filter(
            (companies) => Array.isArray(companies) && companies.length > 0,
          ),
          take(1),
        )
        .subscribe((companies) => {
          this.selectedCompanyContext.next(companies[0]);
        });
    }
  }

  private selectedCompanyContextChangedListener() {
    this.selectedCompanyContext$
      .pipe(
        filter((company) => !!company),
        take(1),
      )
      .subscribe((company) => {
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

  public mapToRBMRole(roles: string[]): rbmRole {
    if (!Array.isArray(roles)) {
      console.warn('Expected roles to be an array, received:', roles);
      return 'gastro';
    }
    const upperRoles = roles.map((role) => role.toUpperCase());
    // Check for refiner roles
    const hasRefinerRole = upperRoles.some((role) =>
      ['SHIPPER', 'CONSOLIDATOR', 'PROCESSOR', 'WHOLESALER'].includes(role),
    );

    if (hasRefinerRole) {
      return 'refiner';
    }
    if (upperRoles.includes('SUPPLIER')) {
      return 'supplier';
    }
    if (upperRoles.includes('PRODUCER')) {
      return 'producer';
    }
    console.log('Falling back to gastro');
    return 'gastro';
  }

  saveOrUpdateUserProfile(userProfile: UserProfile): Observable<UserProfile> {
    return this.checkUserProfileExists(userProfile.person.email).pipe(
      switchMap((exists) => {
        if (exists) {
          // If the profile exists, update it
          return this.updateUserProfile(userProfile);
        } else {
          // If the profile does not exist, create a new one
          return this.createUserProfile(userProfile);
        }
      }),
      catchError((error) => {
        console.error('Error saving or updating user profile:', error);
        return throwError(error);
      }),
    );
  }

  private checkUserProfileExists(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.backendUrl}/exists`, { params }).pipe(
      catchError((error) => {
        console.error('Error checking if user profile exists:', error);
        return of(false);
      }),
    );
  }

  private getUserProfile(email: string): Observable<UserProfile> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserProfile>(`${this.backendUrl}`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return throwError(error);
      }),
    );
  }

  private createUserProfile(userProfile: UserProfile): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.backendUrl, userProfile).pipe(
      catchError((error) => {
        console.error('Error creating user profile:', error);
        return throwError(error);
      }),
    );
  }

  private updateUserProfile(userProfile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.backendUrl}`, userProfile).pipe(
      catchError((error) => {
        console.error('Error updating user profile:', error);
        return throwError(error);
      }),
    );
  }

  // Add a method to fetch and set offers
  private fetchAndSetOffers(companies: CompanyType[]) {
    // Assuming each company has an offers endpoint
    const offerRequests = companies.map((company) =>
      this.http.get<OfferType[]>(`${company.links.offer}`).pipe(
        catchError((error) => {
          console.error(
            `[Store] Error fetching offers for company ${company.id}:`,
            error,
          );
          return of([]);
        }),
      ),
    );

    forkJoin(offerRequests).subscribe((offersArrays) => {
      // Flatten all offers into a single array
      const allOffers = offersArrays.flat();
      console.log('[Store] All offers loaded:', allOffers.length);
      this.offersSubject.next(allOffers);
    });
  }

  // Add a method to get current data state
  public logCurrentState() {
    console.log('[Store] Current state:', {
      companies: this.companiesSubject.getValue().length,
      offers: this.offersSubject.getValue().length,
      loading: this.loadingSubject.getValue(),
    });
  }
}
