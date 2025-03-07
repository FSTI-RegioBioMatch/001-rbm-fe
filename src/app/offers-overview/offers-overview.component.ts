import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NewOfferService } from '../shared/services/new-offer.service';
import { StoreService } from '../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { filter, of, switchMap, take } from 'rxjs';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';
import { AddressType } from '../shared/types/address.type';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { OrderService } from '../shared/services/order.service';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

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
    SliderModule,
    ToastModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './offers-overview.component.html',
  styleUrls: ['./offers-overview.component.scss'],
})
export class OffersOverviewComponent implements OnInit {
  localizationData: { displayLabel: string; value: string }[] = [];
  loading = false;
  offers: any[] = []; // Declare offers to store the list of offers
  range: number = 50; // Example range for filtering offers by distance
  showRequestDialog: boolean = false;
  requestType: 'priceRequest' | 'purchaseIntent' | undefined;
  selectedOffer: any = null;
  requestData: any = {
    deliveryDate: '',
    message: '',
    totalAmount: '',
    pricePerUnit: '',
    unit: '',
  };
  constructor(
    private offerService: NewOfferService,
    private store: StoreService,
    private messageService: MessageService,
    private router: Router,
    private nearbuyTestService: NearbuyTestService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Subscribe to the company context and load offers
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        take(1)
      )
      .subscribe({
        next: () => {
          this.loadOffers();
        },
        error: error => {
          this.loading = false;
          console.error('Error fetching company context:', error);
        }
      });

    // Load localization data
    this.nearbuyTestService.getData().subscribe({
      next: result => {
        this.localizationData = result;
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
      }
    });
  }

  // Helper method to get localized label for ingredient
  getLocalizedLabel(ingredientName: string): string {
    const localizedItem = this.localizationData.find(item => item.value === ingredientName);
    return localizedItem ? localizedItem.displayLabel : ingredientName;
  }

  // Method to load offers, leveraging caching logic
  private loadOffers(): void {
    const address = this.offerService.getAddress();

    if (address) {
      this.fetchOffers(address);
    } else {
      this.store.selectedCompanyContext$
        .pipe(
          filter(company => company !== null),
          switchMap(company => {
            if (company && company.addresses && company.addresses.length > 0) {
              const addressUrl = company.addresses[0].self;
              return this.offerService.getAddressFromUrl(addressUrl);
            } else {
              return of(null);
            }
          }),
          take(1)
        )
        .subscribe({
          next: (address: AddressType | null) => {
            if (address) {
              this.offerService.setAddress(address);
              this.fetchOffers(address);
            } else {
              this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Adresse konnte nicht gefunden werden'});
              this.loading = false;
            }
          },
          error: err => {
            this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Adresse konnte nicht geladen werden'});
            console.error('Error loading address:', err);
            this.loading = false;
          }
        });
    }
  }

  // Fetch offers based on the current address
  private fetchOffers(address: AddressType): void {
    this.offerService.setOffersBySearchRadius(this.range, address)
      .pipe(take(1)) // Ensure only one subscription
      .subscribe({
        next: offers => {
          this.offers = offers; // Store the offers
          this.loading = false; // Stop loading once offers are fetched
        },
        error: error => {
          console.error('Error loading offers:', error);
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Angebote konnten nicht geladen werden'})
          this.loading = false; // Stop loading on error
        }
      });
  }

  // Clear the cache and reload offers
  clearCacheAndReload(): void {
    this.loading = true
    this.loadOffers(); // Reload the offers
  }

  // Method to make a price request for a specific offer
  openRequestDialog(offer: any, requestType: 'priceRequest' | 'purchaseIntent'): void {
    this.selectedOffer = offer;
    this.requestType = requestType;
    this.requestData.message = `Anfrage für ${this.getLocalizedLabel(offer.ontoFoodType.label)}`; // Default message in German
    this.requestData.totalAmount = offer.offerDetails.minAmount?.amount || offer.offerDetails.totalAmount; // Set default amount to minimum or total available
    this.requestData.pricePerUnit = offer.offerDetails.pricePerUnit || 'N/A';
    this.requestData.unit = offer.offerDetails.unit;
    this.showRequestDialog = true;
  }

  cancelRequest(): void {
    this.showRequestDialog = false;
  }

  submitRequest(): void {
    const enteredAmount = parseFloat(this.requestData.totalAmount);
    
    // Validate the entered amount
  
    // Check if delivery date is entered, add more validation
    if (!this.requestData.deliveryDate) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bitte ein Lieferdatum angeben.' });
      return;
    }
  
    // Submit the request based on the request type
    if (this.requestType === 'priceRequest') {
      this.makePriceRequest(this.selectedOffer, this.requestData.deliveryDate, this.requestData.message, enteredAmount);
    } else if (this.requestType === 'purchaseIntent') {
      this.makePurchaseIntent(this.selectedOffer, this.requestData.deliveryDate, this.requestData.message, enteredAmount);
    }
  
    // Close the dialog
    this.showRequestDialog = false;
  }

  makePriceRequest(offer: any, deliveryDate: string, message: string, totalAmount: number): void {
    const priceRequest = {
      offerRef: offer.links.offer,
      message: message,
      deliveryDate: deliveryDate,
      containers: [],
      totalAmount: {
        amount: totalAmount, // Use user-entered amount
        unit: offer.product.unit // Use the unit from offer details
      }
    };

    this.orderService.createPriceRequest(priceRequest).subscribe({
      next: response => {
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Preisanfrage erfolgreich gesendet' });
        // const priceRequestId = response.links.self.split('/').pop();
        // if (priceRequestId && this.shoppingListTrack) {
        //   if (!this.shoppingListTrack.priceRequestIds.includes(priceRequestId)) {
        //     this.shoppingListTrack.priceRequestIds.push(priceRequestId);
        //     this.updateShoppingListTrack(this.shoppingListTrack);
        //   }
        // }
      },
      error: error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Preisanfrage konnte nicht gesendet werden' });
        console.error('Error creating Price Request:', error);
      }
    });
  }

  makePurchaseIntent(offer: any, deliveryDate: string, message: string, totalAmount: number): void {
    const purchaseIntent = {
      offerRef: offer.offerDetails.id,
      deliveryDate: deliveryDate,
      message: message,
      containers: [],
      totalAmount: {
        amount: totalAmount, // Use user-entered amount
        unit: offer.product.unit // Use the unit from offer details
      }
    };

    this.orderService.createPurchaseIntent(purchaseIntent).subscribe({
      next: response => {
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Kaufabsicht erfolgreich gesendet' });
        // const purchaseIntentId = response.links.self.split('/').pop();
        // if (purchaseIntentId && this.shoppingListTrack) {
        //   if (!this.shoppingListTrack.purchaseIntedIds.includes(purchaseIntentId)) {
        //     this.shoppingListTrack.purchaseIntedIds.push(purchaseIntentId);
        //     this.updateShoppingListTrack(this.shoppingListTrack);
        //   }
        // }
      },
      error: error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht konnte nicht gesendet werden' });
        console.error('Error creating Purchase Intent:', error);
      }
    });
  }
  preventInvalidChars(event: KeyboardEvent): void {
    // Prevent entering non-digit characters, except for '.', ',' and control keys
    if (!/[0-9.,]/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }
}
