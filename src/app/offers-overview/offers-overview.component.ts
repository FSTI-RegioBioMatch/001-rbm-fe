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
import { filter, of, switchMap, take } from 'rxjs';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';
import { AddressType } from '../shared/types/address.type';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { OrderService } from '../shared/services/order.service';
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
    FormsModule,
    CardModule,
    SliderModule
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
  range: number = 50
  constructor(
    private offerService: OfferService,
    private store: StoreService,
    private messageService: MessageService,
    private router: Router,
    private nearbuyTestService: NearbuyTestService,
    private orderService: OrderService
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
    // Check if the address is already set
    const address = this.offerService.address;
    
    if (address) {
      // Address is already set, fetch offers from cache or new
      this.fetchOffers(address);
    } else {
      // Address is not set, fetch it asynchronously from the company context
      this.store.selectedCompanyContext$
        .pipe(
          filter(company => company !== null),  // Ensure company context is not null
          switchMap((company) => {
            // Fetch the address based on the company context
            if (company && company.addresses && company.addresses.length > 0) {
              const addressUrl = company.addresses[0].self;
              return this.offerService.getAddress(addressUrl); // Fetch address from the URL
            } else {
              return of(null); // Return null if no address is available
            }
          }),
          take(1) // Only take the first valid address emission
        )
        .subscribe({
          next: (address: AddressType | null) => {
            if (address) {
              // Set the address in the OfferService
              this.offerService.setAddress(address);
              // Fetch the offers once the address is available
              this.fetchOffers(address);
            } else {
              // Handle the case where no address is available
              this.errorMessage = 'Address not available';
              this.loading = false;
            }
          },
          error: err => {
            this.errorMessage = 'Error loading address';
            console.error('Error loading address:', err);
            this.loading = false;
          }
        });
    }
  }
  
  private fetchOffers(address: AddressType): void {
    this.offerService.setOffersBySearchRadius(this.range, address); // Set initial search radius and address
  
    // Subscribe to the offers and handle both cached or new offers
    this.offerService.offers$
      .pipe(take(1)) // Ensure only one subscription
      .subscribe({
        next: (offers) => {
          if (offers && offers.length > 0) {
            console.log('Offers loaded from cache or new fetch:', offers);
            this.offers = offers; // Store the offers
          } else {
            console.log('No offers found, fetching new offers');
            // If no offers are available, trigger a new fetch
            this.offerService.setOffersBySearchRadius(this.range, address);
          }
          this.loading = false; // Stop loading once offers are fetched
        },
        error: (error) => {
          console.error('Error loading offers:', error);
          this.errorMessage = 'Error loading offers';
          this.loading = false; // Stop loading on error
        }
      });
  }
  clearCacheAndReload(): void {
    // Clear the cache
    this.offerService.clearOfferCache();
  
    // Reload the offers
    const address = this.offerService.address;
    if (address) {
      this.fetchOffers(address);
    } else {
      this.offerService.address$
        .pipe(take(1)) // Ensure we only subscribe once
        .subscribe({
          next: (address) => {
            if (address) {
              this.fetchOffers(address);
            } else {
              this.errorMessage = 'No address available';
            }
          },
          error: (err) => {
            this.errorMessage = 'Error loading address';
            console.error('Error loading address:', err);
          }
        });
    }
  }
  makePriceRequest(offer: any): void {
    console.log('Making price request for offer:', offer);

    // Construct the PriceRequest object inline without importing a model
    const productName = this.getLocalizedLabel(offer.ontoFoodType.label);
    const priceRequest = {
      offerRef: offer.links.offer,  // Reference to the offer
      message: `Requesting price for ${productName}`,  // Custom message
      deliveryDate: '2024-12-12',  // Example delivery date, this can be dynamic
      containers: [],  // Using containers from the offer
      totalAmount: offer.offerDetails.totalAmount  // Total amount from the offer
    };

    // Send the price request using the OrderService
    this.orderService.createPriceRequest(priceRequest).subscribe(
      response => {
        console.log('Price Request successfully created:', response);
      },
      error => {
        console.error('Error creating Price Request:', error);
      }
    );
  }
  // Method to make a purchase intent
  makePurchaseIntent(offer: any): void {
    console.log('Making purchase intent for offer:', offer);
    const productName = this.getLocalizedLabel(offer.ontoFoodType.label);
    // Construct the PurchaseIntent object inline without importing a model
    const purchaseIntent = {
      offerRef: offer.offerDetails.id,  // Reference to the offer
      deliveryDate: '2024-12-12',  // Example delivery date, can be dynamic
      message: `Purchase intent for ${productName}`,  // Custom message
      containers: [],
      totalAmount: offer.offerDetails.totalAmount  // Total amount from the offer
    };

    // Send the purchase intent using the OrderService
    this.orderService.createPurchaseIntent(purchaseIntent).subscribe(
      response => {
        console.log('Purchase Intent successfully created:', response);
      },
      error => {
        console.error('Error creating Purchase Intent:', error);
      }
    );
  }
}