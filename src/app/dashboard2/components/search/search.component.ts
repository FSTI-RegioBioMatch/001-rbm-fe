import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { CompanyType } from '../../../shared/types/company.type';
import { OfferType } from '../../../shared/types/offer.type';
import {
  SearchService,
  SearchFilters,
} from '../../../shared/services/search.service';
import { Subject, takeUntil, Subscription, tap } from 'rxjs';
import { PublicRecipeType } from '../../../shared/types/public-recipe.type';

interface FilterDisplay {
  roles: { label: string; value: string }[];
  city: string;
  verified: boolean;
  dateRange: Date[] | null;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
  ],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() searchTerm: string = '';
  private destroy$ = new Subject<void>();
  private searchSubscription?: Subscription;

  // Component properties
  filteredCompanies: CompanyType[] = [];
  filteredOffers: OfferType[] = [];
  selectedCompany: CompanyType | null = null;
  selectedOffer: OfferType | null = null;
  displayDialog: boolean = false;
  loaded: boolean = false;
  selectedRoles: string[] = [];
  filteredRecipes: PublicRecipeType[] = [];
  selectedRecipe: PublicRecipeType | null = null;
  displayRecipeDialog: boolean = false;

  filterDisplay: FilterDisplay = {
    roles: [
      { label: 'Lieferant', value: 'SUPPLIER' },
      { label: 'Verarbeiter', value: 'PROCESSOR' },
      { label: 'Konsolidierer', value: 'CONSOLIDATOR' },
      { label: 'Spediteur', value: 'SHIPPER' },
      { label: 'Großhändler', value: 'WHOLESALER' },
      { label: 'Produzent', value: 'PRODUCER' },
      { label: 'Gastro', value: 'GASTRO' },
    ],
    city: '',
    verified: false,
    dateRange: null,
  };

  constructor(private searchService: SearchService) {
    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.filteredCompanies = results.companies;
        this.filteredOffers = results.offers;
        this.filteredRecipes = results.recipes;
      });
  }

  ngOnInit(): void {
    this.initializeSearchSubscription();
    this.loaded = true;
  }

  private initializeSearchSubscription(): void {
    this.searchSubscription = this.searchService.searchResults$
      .pipe(
        takeUntil(this.destroy$),
        tap((results) => {
          this.filteredCompanies = results.companies;
          this.filteredOffers = results.offers;
          this.filteredRecipes = results.recipes;
        }),
      )
      .subscribe();
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchService.search(inputElement.value);
  }

  updateFilters(): void {
    const filters: SearchFilters = {
      roles: this.selectedRoles as any[],
      verified: this.filterDisplay.verified,
      city: this.filterDisplay.city,
      dateRange: this.filterDisplay.dateRange
        ? {
            start: this.filterDisplay.dateRange[0],
            end: this.filterDisplay.dateRange[1],
          }
        : undefined,
    };
    this.searchService.updateFilters(filters);
  }

  showDetailsCompany(company: CompanyType): void {
    this.selectedCompany = company;
    this.selectedOffer = null;
    this.displayDialog = true;
  }

  getFirstImageUrl(recipe: PublicRecipeType): string | null {
    return recipe.image_urls && recipe.image_urls.length > 0
      ? recipe.image_urls[0]
      : null;
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'vegetarian':
        return 'bg-green-100 text-green-900';
      case 'vegan':
        return 'bg-teal-100 text-teal-900';
      case 'gluten-free':
        return 'bg-yellow-100 text-yellow-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  }

  getRecipeImageUrl(recipe: PublicRecipeType): string | undefined {
    if (recipe.image_urls && recipe.image_urls.length > 0) {
      return recipe.image_urls[0];
    }
    return undefined;
  }

  hasImage(recipe: PublicRecipeType): boolean {
    return !!(recipe.image_urls && recipe.image_urls.length > 0);
  }

  getImageUrlOrPlaceholder(recipe: PublicRecipeType): string {
    return (
      this.getRecipeImageUrl(recipe) || '/assets/images/recipe-placeholder.jpg'
    );
  }

  showRecipeDetails(recipe: PublicRecipeType): void {
    this.selectedRecipe = recipe;
    this.displayRecipeDialog = true;
  }

  showDetailsOffer(offer: OfferType): void {
    this.selectedOffer = offer;
    this.selectedCompany = null;
    this.displayDialog = true;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    // Clear selections and dialogs
    this.selectedCompany = null;
    this.selectedOffer = null;
    this.selectedRecipe = null;
    this.displayDialog = false;
    this.displayRecipeDialog = false;

    // Clear arrays
    this.filteredCompanies = [];
    this.filteredOffers = [];
    this.filteredRecipes = [];
    this.selectedRoles = [];
  }
}
