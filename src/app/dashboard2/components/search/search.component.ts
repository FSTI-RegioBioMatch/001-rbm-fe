import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { StoreService } from '../../../shared/store/store.service';

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
  providers: [StoreService],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filteredCompanies: CompanyType[] = [];
  filteredOffers: OfferType[] = [];
  selectedCompany: CompanyType | null = null;
  selectedOffer: OfferType | null = null;
  displayDialog: boolean = false;
  loaded = false;
  selectedRoles: string[] = [];

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

  constructor(
    private searchService: SearchService,
    private storeService: StoreService,
  ) {
    // Subscribe to store data
    this.storeService.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe((companies: CompanyType[]) => {
        console.log('Available companies:', companies.length);
      });

    this.storeService.offers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((offers: OfferType[]) => {
        console.log('Available offers:', offers.length);
      });

    // Subscribe to search results
    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        console.log('Search results:', results);
        this.filteredCompanies = results.companies;
        this.filteredOffers = results.offers;
      });
  }

  ngOnInit(): void {
    this.loaded = true;
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const searchTerm = inputElement.value;
    console.log('Searching for:', searchTerm);
    this.searchService.search(searchTerm);
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
    console.log('Updating filters:', filters);
    this.searchService.updateFilters(filters);
  }

  showDetailsCompany(company: CompanyType): void {
    console.log('Showing company details:', company);
    this.selectedCompany = company;
    this.selectedOffer = null;
    this.displayDialog = true;
  }

  showDetailsOffer(offer: OfferType): void {
    console.log('Showing offer details:', offer);
    this.selectedOffer = offer;
    this.selectedCompany = null;
    this.displayDialog = true;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
