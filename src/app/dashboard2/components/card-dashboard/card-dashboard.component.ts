import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardCompanyComponent } from '../card-company/card-company.component';
import { CardModule } from 'primeng/card';
import { MapComponent } from '../map/map.component';
import { PrimeTemplate, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SearchComponent } from '../search/search.component';
import { AddressType } from '../../../shared/types/address.type';
import { CompanyType } from '../../../shared/types/company.type';
import { PersonType } from '../../../shared/types/person.type';
import { OfferType } from '../../../shared/types/offer.type';
import { filter, tap } from 'rxjs/operators';
import { OfferService } from '../../../shared/services/offer.service';
import { StoreService } from '../../../shared/store/store.service';
import { NewMenuplanService } from '../../../shared/services/new-menuplan.service';
import { SearchService } from '../../../shared/services/search.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-card-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardCompanyComponent,
    CardModule,
    MapComponent,
    PrimeTemplate,
    TableModule,
    ToastModule,
    InputTextModule,
    SearchComponent,
  ],
  providers: [MessageService],
  templateUrl: './card-dashboard.component.html',
  styleUrl: './card-dashboard.component.scss',
})
export class CardDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions = new Subscription();

  company: CompanyType | null = null;
  person: PersonType | null = null;
  offers: OfferType[] = [];
  menuPlans: any[] = [];
  mapLat: number = 0;
  mapLng: number = 0;
  searchText: string = '';
  isSearchActive: boolean = false;

  constructor(
    private searchService: SearchService,
    private storeService: StoreService,
    private offerService: OfferService,
    private menuPlanningService: NewMenuplanService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    // Monitor available companies
    this.subscriptions.add(
      this.storeService.companies$
        .pipe(
          takeUntil(this.destroy$),
          tap((companies: CompanyType[]) => {
            console.log('[CardDashboard] Available companies:', {
              count: companies.length,
              companies: companies.map((c) => ({
                id: c.id,
                name: c.company?.name,
              })),
            });
          }),
        )
        .subscribe(),
    );

    // Subscribe to person updates
    this.subscriptions.add(
      this.storeService.person$
        .pipe(takeUntil(this.destroy$))
        .subscribe((person: PersonType | null) => {
          this.person = person;
          this.messageService.add({
            severity: 'info',
            summary: 'OK',
            detail: 'Person wurde aktualisiert',
          });
        }),
    );

    // Subscribe to company context
    this.subscriptions.add(
      this.storeService.selectedCompanyContext$
        .pipe(
          filter((company): company is CompanyType => company !== null),
          takeUntil(this.destroy$),
        )
        .subscribe((company) => {
          this.company = company;
          this.messageService.add({
            severity: 'info',
            summary: 'OK',
            detail: 'Unternehmen wurde aktualisiert',
          });
          this.updateCompanyAddress(company);
        }),
    );

    // Subscribe to offers
    this.subscriptions.add(
      this.offerService.offers$
        .pipe(takeUntil(this.destroy$))
        .subscribe((offers: OfferType[]) => {
          this.offers = offers;
        }),
    );
  }

  private updateCompanyAddress(company: CompanyType): void {
    if (
      !company?.addresses ||
      !Array.isArray(company.addresses) ||
      company.addresses.length === 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Keine gültige Unternehmensaddresse gefunden',
      });
      return;
    }

    const firstAddress = company.addresses[0];
    if (!firstAddress?.self) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Ungültiges Adressformat',
      });
      return;
    }

    this.subscriptions.add(
      this.offerService
        .getAddress(firstAddress.self)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (address: AddressType) => {
            this.messageService.add({
              severity: 'info',
              summary: 'OK',
              detail: 'Addresse wurde aktualisiert',
            });
            this.offerService.setAddress(address);
            this.mapLat = address.lat;
            this.mapLng = address.lon;

            const searchRadiusInKM = 50;
            this.offerService.setOffersBySearchRadius(
              searchRadiusInKM,
              address,
            );
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Keine gültige Unternehmensaddresse gefunden',
            });
          },
        }),
    );
  }

  onSearchChange(term: string): void {
    const trimmedTerm = term.trim();
    this.isSearchActive = trimmedTerm.length >= 2;

    if (this.isSearchActive) {
      this.searchService.search(trimmedTerm);
    } else if (trimmedTerm.length === 0) {
      this.searchService.clearSearch();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();

    this.company = null;
    this.person = null;
    this.offers = [];
    this.menuPlans = [];
    this.mapLat = 0;
    this.mapLng = 0;
    this.searchText = '';
    this.isSearchActive = false;
  }
}
