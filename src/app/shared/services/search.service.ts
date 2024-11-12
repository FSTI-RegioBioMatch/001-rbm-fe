import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  tap,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { CompanyType } from '../types/company.type';
import { OfferType } from '../types/offer.type';
import { RecipeType } from '../types/recipe.type';
import { StoreService } from '../store/store.service';
import { CompanyService } from './company.service';
import { OfferService } from './offer.service';
import { PublicRecipeService } from './public-recipe.service';
import { PublicRecipeType } from '../types/public-recipe.type';
import { AddressType } from '../types/address.type';

export interface SearchResults {
  companies: CompanyType[];
  offers: OfferType[];
  recipes: PublicRecipeType[];
  menus: any[];
}

export interface SearchFilters {
  roles?: string[];
  verified?: boolean;
  city?: string;
  permanent?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  ontoFoodTypes?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchTermSubject = new BehaviorSubject<string>('');
  private filtersSubject = new BehaviorSubject<SearchFilters>({});
  private readonly defaultSearchRadius = 50;
  private searchRadiusKM = this.defaultSearchRadius;
  public searchResults$: Observable<SearchResults>;

  constructor(
    private storeService: StoreService,
    private companyService: CompanyService,
    private offerService: OfferService,
    private publicRecipeService: PublicRecipeService,
  ) {
    console.log('[SearchService] Initializing');

    // Initialize both services with location data when available
    this.storeService.selectedCompanyContext$
      .pipe(
        tap((company) =>
          console.log('[SearchService] Selected company context:', company),
        ),
        switchMap((company) => {
          if (company && company.addresses && company.addresses.length > 0) {
            return this.companyService.getAddress(company.addresses[0].self);
          }
          throw new Error('No address available');
        }),
      )
      .subscribe({
        next: (address: AddressType) => {
          console.log('[SearchService] Got address:', address);
          this.initializeSearchData(address);
        },
        error: (error) =>
          console.error('[SearchService] Error getting address:', error),
      });

    // Create a stream of recipes that starts with an empty array
    const recipes$ = this.publicRecipeService.getRecipes().pipe(
      tap((recipes: PublicRecipeType[]) =>
        console.log('[Search] Loaded recipes:', recipes.length),
      ),
      catchError((error: Error) => {
        console.error('[Search] Error loading recipes:', error);
        return of([] as PublicRecipeType[]);
      }),
    );

    // Combine search term with data sources
    this.searchResults$ = combineLatest([
      this.searchTermSubject.asObservable().pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((term) => console.log('[Search] Processing term:', term)),
      ),
      this.companyService.companies$.pipe(
        tap((companies) =>
          console.log('[Search] Processing companies:', companies.length),
        ),
      ),
      this.offerService.offers$.pipe(
        tap((offers) =>
          console.log('[Search] Processing offers:', offers.length),
        ),
      ),
      recipes$.pipe(
        tap((recipes) =>
          console.log('[Search] Processing recipes:', recipes.length),
        ),
      ),
    ]).pipe(
      map(([searchTerm, companies, offers, recipes]) => {
        console.log('[Search] Raw data:', {
          term: searchTerm,
          companiesCount: companies.length,
          offersCount: offers.length,
          recipesCount: recipes.length,
        });

        if (!searchTerm.trim()) {
          return { companies: [], offers: [], recipes: [], menus: [] };
        }

        const searchTermLower = searchTerm.toLowerCase();

        // Filter each data type
        const filteredCompanies = companies.filter((company) => {
          const nameMatch = company.company?.name
            ?.toLowerCase()
            .includes(searchTermLower);
          const labelMatch = company.company?.label
            ?.toLowerCase()
            .includes(searchTermLower);
          const cityMatch = company.address?.city
            ?.toLowerCase()
            .includes(searchTermLower);

          console.log(
            `[SearchService] Company "${company.company?.name}" matches: ${nameMatch || labelMatch || cityMatch}`,
          );

          return nameMatch || labelMatch || cityMatch;
        });

        // Filter offers
        const filteredOffers = offers.filter((offer) => {
          const companyMatch = offer.company?.name
            ?.toLowerCase()
            .includes(searchTermLower);
          const labelMatch = offer.ontoFoodType?.label
            ?.toLowerCase()
            .includes(searchTermLower);
          return companyMatch || labelMatch;
        });

        const results = {
          companies: filteredCompanies,
          offers: filteredOffers,
          recipes: [],
          menus: [],
        };

        const filteredRecipes = this.filterRecipesInternal(
          recipes,
          searchTermLower,
        );

        console.log('[Search] Filtered results:', {
          companies: filteredCompanies.length,
          offers: filteredOffers.length,
          recipes: filteredRecipes.length,
        });

        return {
          results,
          companies: filteredCompanies,
          offers: filteredOffers,
          recipes: filteredRecipes,
          menus: [],
        };
      }),
      tap((results) => {
        console.log('[Search] Emitting results:', {
          companies: results.companies.length,
          offers: results.offers.length,
          recipes: results.recipes.length,
        });
      }),
    );

    // Subscribe to search results for debugging
    this.searchResults$.subscribe(
      (results) => console.log('[Search] Search results updated:', results),
      (error) => console.error('[Search] Error in search results:', error),
    );
  }

  private filterCompaniesInternal(
    companies: CompanyType[],
    searchTerm: string,
  ): CompanyType[] {
    const filtered = companies.filter((company) => {
      const nameMatch = company.company?.name
        ?.toLowerCase()
        .includes(searchTerm);
      const labelMatch = company.company?.label
        ?.toLowerCase()
        .includes(searchTerm);
      const cityMatch = company.address?.city
        ?.toLowerCase()
        .includes(searchTerm);

      console.log('[Search] Checking company:', {
        name: company.company?.name,
        matches: nameMatch || labelMatch || cityMatch,
      });

      return nameMatch || labelMatch || cityMatch;
    });

    console.log('[Search] Filtered companies:', filtered.length);
    return filtered;
  }

  private filterOffersInternal(
    offers: OfferType[],
    searchTerm: string,
  ): OfferType[] {
    const filtered = offers.filter((offer) => {
      const companyMatch = offer.company?.name
        ?.toLowerCase()
        .includes(searchTerm);
      const labelMatch = offer.ontoFoodType?.label
        ?.toLowerCase()
        .includes(searchTerm);

      console.log('[Search] Checking offer:', {
        company: offer.company?.name,
        label: offer.ontoFoodType?.label,
        matches: companyMatch || labelMatch,
      });

      return companyMatch || labelMatch;
    });

    console.log('[Search] Filtered offers:', filtered.length);
    return filtered;
  }

  private filterRecipesInternal(
    recipes: PublicRecipeType[],
    searchTerm: string,
  ): PublicRecipeType[] {
    const filtered = recipes.filter((recipe) => {
      const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
      const instructionsMatch = recipe.instructions
        .toLowerCase()
        .includes(searchTerm);
      const ingredientsMatch = recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(searchTerm),
      );
      const badgesMatch = recipe.badges.some((badge) =>
        badge.text.toLowerCase().includes(searchTerm),
      );

      console.log('[Search] Checking recipe:', {
        title: recipe.title,
        matches:
          titleMatch || instructionsMatch || ingredientsMatch || badgesMatch,
      });

      return titleMatch || instructionsMatch || ingredientsMatch || badgesMatch;
    });

    console.log('[Search] Filtered recipes:', filtered.length);
    return filtered;
  }

  search(term: string): void {
    console.log('[Search] Setting search term:', term);
    this.searchTermSubject.next(term);
  }

  updateFilters(filters: SearchFilters): void {
    console.log('[Search] Updating filters:', filters);
    this.filtersSubject.next(filters);
  }

  clearSearch(): void {
    console.log('[Search] Clearing search');
    this.searchTermSubject.next('');
    this.filtersSubject.next({});
  }

  setSearchRadius(radiusKM: number): void {
    this.searchRadiusKM = radiusKM;
    // Re-initialize search data with new radius if we have an address
    if (this.companyService.address) {
      this.initializeSearchData(this.companyService.address);
    }
  }

  private initializeSearchData(address: AddressType): void {
    console.log('[Search] Initializing search data with address:', address);
    this.companyService.setCompaniesBySearchCriteria(
      this.searchRadiusKM,
      address,
    );
    this.offerService.setOffersBySearchRadius(this.searchRadiusKM, address);
  }
}
