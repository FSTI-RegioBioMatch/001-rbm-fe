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
    // Initialize both services with location data when available
    this.storeService.selectedCompanyContext$
      .pipe(
        switchMap((company) => {
          if (company && company.addresses && company.addresses.length > 0) {
            return this.companyService.getAddress(company.addresses[0].self);
          }
          throw new Error('No address available');
        }),
      )
      .subscribe({
        next: (address: AddressType) => {
          this.initializeSearchData(address);
        },
        error: (error) =>
          console.error('[SearchService] Error getting address:', error),
      });

    // Create a stream of recipes that starts with an empty array
    const recipes$ = this.publicRecipeService.getRecipes().pipe(
      catchError((error: Error) => {
        console.error('[Search] Error loading recipes:', error);
        return of([] as PublicRecipeType[]);
      }),
    );

    // Combine search term with data sources
    this.searchResults$ = combineLatest([
      this.searchTermSubject
        .asObservable()
        .pipe(debounceTime(300), distinctUntilChanged()),
      this.companyService.companies$,
      this.offerService.offers$,
      recipes$,
    ]).pipe(
      map(([searchTerm, companies, offers, recipes]) => {
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
        return {
          results,
          companies: filteredCompanies,
          offers: filteredOffers,
          recipes: filteredRecipes,
          menus: [],
        };
      }),
    );
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
      return titleMatch || instructionsMatch || ingredientsMatch || badgesMatch;
    });

    return filtered;
  }

  search(term: string): void {
    this.searchTermSubject.next(term);
  }

  updateFilters(filters: SearchFilters): void {
    this.filtersSubject.next(filters);
  }

  clearSearch(): void {
    this.searchTermSubject.next('');
    this.filtersSubject.next({});
  }

  setSearchRadius(radiusKM: number): void {
    this.searchRadiusKM = radiusKM;
    if (this.companyService.address) {
      this.initializeSearchData(this.companyService.address);
    }
  }

  private initializeSearchData(address: AddressType): void {
    this.companyService.setCompaniesBySearchCriteria(
      this.searchRadiusKM,
      address,
    );
    this.offerService.setOffersBySearchRadius(this.searchRadiusKM, address);
  }
}
