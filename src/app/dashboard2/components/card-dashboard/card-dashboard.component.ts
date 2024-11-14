import { Component, OnInit } from '@angular/core';
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
export class CardDashboardComponent implements OnInit {
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
  ) {
    // Monitor available companies
    this.storeService.companies$
      .pipe(
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
      .subscribe();
  }

  ngOnInit() {
    this.getCurrentPersonAndCompanyContext();
    this.subscribeToOffers();
    this.getSelectedCompanyContext();

    this.storeService.selectedCompanyContext$
      .pipe(filter((company: CompanyType | null) => company !== null))
      .subscribe(() => {
        this.getMenuPlans();
      });
  }

  private subscribeToOffers() {
    this.offerService.offers$.subscribe((offers: OfferType[]) => {
      this.offers = offers;
    });
  }

  onSearchChange(term: string) {
    console.log('[CardDashboard] Search term changed:', term);
    if (term.trim().length >= 2) {
      this.isSearchActive = true;
      this.searchService.search(term);
    } else if (term.trim().length === 0) {
      this.isSearchActive = false;
      this.searchService.clearSearch();
    }
  }

  private getMenuPlans() {
    this.menuPlanningService.getAllMenuPlans().subscribe((menuPlans) => {
      this.menuPlans = menuPlans;
      this.messageService.add({
        severity: 'info',
        summary: 'OK',
        detail: 'Menüpläne wurden aktualisiert',
      });
    });
  }

  private getSelectedCompanyContext() {
    this.storeService.selectedCompanyContext$.subscribe(
      (company: CompanyType | null) => {
        if (company && company.addresses && company.addresses.length > 0) {
          const addressUrl = company.addresses[0].self;
          this.offerService
            .getAddress(addressUrl)
            .subscribe((address: AddressType) => {
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
            });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Keine gültige Unternehmensaddresse gefunden',
          });
        }
      },
    );
  }

  private getCurrentPersonAndCompanyContext() {
    this.storeService.person$.subscribe((person: PersonType | null) => {
      this.messageService.add({
        severity: 'info',
        summary: 'OK',
        detail: 'Person wurde aktualisiert',
      });
      this.person = person;
    });

    this.storeService.selectedCompanyContext$.subscribe(
      (company: CompanyType | null) => {
        this.company = company;
        this.messageService.add({
          severity: 'info',
          summary: 'OK',
          detail: 'Unternehmen wurde aktualisiert',
        });
      },
    );
  }
}
