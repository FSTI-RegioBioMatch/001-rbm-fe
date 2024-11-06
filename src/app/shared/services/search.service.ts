import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { CompanyType } from '../types/company.type';
import { OfferType } from '../types/offer.type';
import { RecipeType } from '../types/recipe.type';
import { StoreService } from '../store/store.service';
import { NearbuyRole } from '../types/nearbuy-role.type';

export interface SearchResults {
  companies: CompanyType[];
  offers: OfferType[];
  recipes: RecipeType[];
  menus: any[];
}

export interface SearchFilters {
  roles?: NearbuyRole[];
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
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  public searchResults$: Observable<SearchResults>;

  constructor(private storeService: StoreService) {
    // Connect to store data
    this.searchResults$ = combineLatest([
      this.searchTermSubject
        .asObservable()
        .pipe(debounceTime(300), distinctUntilChanged()),
      this.storeService.companies$,
      this.storeService.offers$,
    ]).pipe(
      map(([searchTerm, companies, offers]) => {
        console.log('Processing search:', {
          term: searchTerm,
          companiesCount: companies.length,
          offersCount: offers.length,
        });

        if (!searchTerm.trim()) {
          return {
            companies: [],
            offers: [],
            recipes: [], // Add empty arrays for recipes and menus
            menus: [],
          };
        }

        const searchTermLower = searchTerm.toLowerCase();

        return {
          companies: companies.filter((company) =>
            company.company?.name?.toLowerCase().includes(searchTermLower),
          ),
          offers: offers.filter(
            (offer) =>
              offer.company?.name?.toLowerCase().includes(searchTermLower) ||
              offer.ontoFoodType?.label
                ?.toLowerCase()
                .includes(searchTermLower),
          ),
          recipes: [], // Add empty arrays for now
          menus: [], // Can be implemented later if needed
        } as SearchResults;
      }),
    );
  }

  private filterCompanies(
    companies: CompanyType[],
    searchTerm: string,
    filters: SearchFilters,
  ): CompanyType[] {
    return companies.filter((company) => {
      // Basic search term matching
      const matchesSearch = searchTerm
        ? company.company?.name?.toLowerCase().includes(searchTerm) ||
          company.company?.label?.toLowerCase().includes(searchTerm) ||
          company.address?.city?.toLowerCase().includes(searchTerm) ||
          company.ontoFoodType?.label?.toLowerCase().includes(searchTerm)
        : true;

      // Filter matching
      const matchesVerified =
        filters.verified !== undefined
          ? company.company?.verified === filters.verified
          : true;

      const matchesRoles = filters.roles?.length
        ? filters.roles.some((role) => company.roles?.includes(role))
        : true;

      const matchesCity = filters.city
        ? company.address?.city
            ?.toLowerCase()
            .includes(filters.city.toLowerCase())
        : true;

      const matchesPermanent =
        filters.permanent !== undefined
          ? company.product?.isPermanent === filters.permanent
          : true;

      return (
        matchesSearch &&
        matchesVerified &&
        matchesRoles &&
        matchesCity &&
        matchesPermanent
      );
    });
  }

  private filterOffers(
    offers: OfferType[],
    searchTerm: string,
    filters: SearchFilters,
  ): OfferType[] {
    return offers.filter((offer) => {
      // Basic search term matching
      const matchesSearch = searchTerm
        ? offer.company?.name?.toLowerCase().includes(searchTerm) ||
          offer.company?.label?.toLowerCase().includes(searchTerm) ||
          offer.address?.city?.toLowerCase().includes(searchTerm) ||
          offer.ontoFoodType?.label?.toLowerCase().includes(searchTerm)
        : true;

      // Filter matching
      const matchesVerified =
        filters.verified !== undefined
          ? offer.company?.verified === filters.verified
          : true;

      const matchesRoles = filters.roles?.length
        ? filters.roles.some((role) => offer.roles?.includes(role))
        : true;

      const matchesCity = filters.city
        ? offer.address?.city
            ?.toLowerCase()
            .includes(filters.city.toLowerCase())
        : true;

      // Date range filtering
      const matchesDateRange = filters.dateRange
        ? this.isWithinDateRange(
            offer.product?.dateStart,
            offer.product?.dateEnd,
            filters.dateRange,
          )
        : true;

      // OntoFood type filtering
      const matchesOntoFoodType = filters.ontoFoodTypes?.length
        ? filters.ontoFoodTypes.includes(offer.ontoFoodType?.label || '')
        : true;

      return (
        matchesSearch &&
        matchesVerified &&
        matchesRoles &&
        matchesCity &&
        matchesDateRange &&
        matchesOntoFoodType
      );
    });
  }

  private isWithinDateRange(
    startDate: string | undefined,
    endDate: string | undefined,
    filterRange: { start: Date; end: Date },
  ): boolean {
    if (!startDate || !endDate) return false;

    const offerStart = new Date(startDate);
    const offerEnd = new Date(endDate);

    return offerStart <= filterRange.end && offerEnd >= filterRange.start;
  }

  search(term: string): void {
    console.log('Searching for:', term);
    this.searchTermSubject.next(term);
  }

  updateFilters(filters: SearchFilters): void {
    this.filtersSubject.next(filters);
  }

  clearSearch(): void {
    this.searchTermSubject.next('');
    this.filtersSubject.next({});
  }
}
