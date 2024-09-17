import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { OfferService } from '../shared/services/offer.service';
import { StoreService } from '../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { filter, switchMap } from 'rxjs';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';
import { AddressType } from '../shared/types/address.type';

@Component({
  selector: 'app-offers-overview',
  standalone: true,
  imports: [
    ButtonModule,
    RouterLink,
    DatePipe,
    CommonModule,
    AccordionModule,
    ProgressSpinnerModule,
    PanelModule,
    CardModule,

  ],
  providers: [MessageService],
  templateUrl: './offers-overview.component.html',
  styleUrl: './offers-overview.component.scss'
})
export class OffersOverviewComponent implements OnInit {

  localizationData: { displayLabel: string; value: string }[] = [];
  loading = false;
  offers: any[] = [];  // Declare offers to store the list of offers
  errorMessage: string = ''; // Declare errorMessage for displaying errors

  constructor(
    private offerService: OfferService,
    private store: StoreService,
    private messageService: MessageService,
    private router: Router,
    private nearbuyTestService: NearbuyTestService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Subscribe to the company context and route parameters
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null) // Ensure company context is not null
      )
      .subscribe({
        next: () => {
          this.loadOffers(); // Now load offers after the shopping list is fetched
        },
        error: error => {
          this.loading = false;
          console.error('Error fetching company context:', error);
        }
      });

    // Load localization data
    this.nearbuyTestService.getData().subscribe({
      next: result => {
        this.localizationData = result; // Save localization data for later use
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
      }
    });
  }

  getLocalizedLabel(ingredientName: string): string {
    const localizedItem = this.localizationData.find(item => item.value === ingredientName);
    return localizedItem ? localizedItem.displayLabel : ingredientName;
  }

  private loadOffers(): void {
    // Check if the address is set before fetching offers
    const address = this.offerService.address;
    if (address) {
      this.fetchOffers(address);
    } else {
      // Wait for the address to be set or fetch it asynchronously if needed
      this.offerService.address$.subscribe({
        next: address => {
          if (address) {
            this.fetchOffers(address);
          }
        },
        error: err => {
          this.errorMessage = 'Fehler beim Laden der Adresse';
          console.error('Error loading address:', err);
        }
      });
    }
  }

  private fetchOffers(address: AddressType): void {
    this.offerService.setOffersBySearchRadius(50, address); // Set initial search radius and address

    this.offerService.offers$.subscribe({
      next: offers => {
        console.log('Offers loaded:', offers);
        this.offers = offers; // Store the offers
        this.loading = false; // Stop loading once offers are fetched
      },
      error: error => {
        console.error('Error loading offers:', error);
        this.errorMessage = 'Fehler beim Laden der Angebote';
        this.loading = false; // Stop loading on error
      }
    });
  }

}