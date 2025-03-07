import { Component, OnInit } from '@angular/core';
import { StoreService } from '../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { OfferService } from '../shared/services/offer.service';
import { filter, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { OrderService, PriceRequestStatus, PurchaseIntentStatus } from '../shared/services/order.service';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PersonType } from '../shared/types/person.type';
import { LocalizeService } from '../shared/services/localize.service';

@Component({
  selector: 'app-pr-pi-overview',
  standalone: true,
  templateUrl: './pr-pi-overview.html',
  styleUrls: ['./pr-pi-overview.scss'],
  providers: [MessageService],
  imports: [
    CommonModule,
    CardModule,
    AccordionModule,
    TableModule,
    TabMenuModule,
    TabViewModule,
    ButtonModule,
    ProgressSpinnerModule,
    PaginatorModule,
    ToastModule,
    DialogModule
  ]
})
export class PrPiOverviewComponent implements OnInit {

  purchaseIntents: any[] = [];
  priceRequests: any[] = [];
  loadingOrders = false;
  selectedPriceRequest: any | null = null;
  selectedPurchaseIntent: any | null = null;
  me: any;
  filteredPurchaseIntents: any[] = [];
  filteredPriceRequests: any[] = [];
  selectedPurchaseIntentStatus: PurchaseIntentStatus | null = null;
  selectedPriceRequestStatus: PriceRequestStatus | null = null;
  loadingDialog = false;

  priceOfferDialogVisible: boolean = false;
  totalPrice: number | null = null;
  calculatedPricePerUnit: number | null = null;

  priceRequestStatuses = [
    { label: 'Alle', value: null },
    { label: 'Ausstehend', value: 'PENDING' },
    { label: 'Preis hinzugefügt', value: 'PRICE_ADDED' },
    { label: 'Abgeschlossen', value: 'COMPLETED' },
    { label: 'Vom Käufer storniert', value: 'CANCELED_BY_BUYER' },
    { label: 'Vom Verkäufer storniert', value: 'CANCELED_BY_SELLER' },
    { label: 'Abgelehnt', value: 'REJECTED' },
  ];
  
  purchaseIntentStatuses = [
    { label: 'Alle', value: null },
    { label: 'Ausstehend', value: 'PENDING' },
    { label: 'Akzeptiert', value: 'ACCEPTED' },
    { label: 'Abgeschlossen', value: 'COMPLETED' },
    { label: 'Vom Käufer storniert', value: 'CANCELED_BY_BUYER' },
    { label: 'Vom Verkäufer storniert', value: 'CANCELED_BY_SELLER' },
    { label: 'Abgelehnt', value: 'REJECTED' },
  ];
  companyId: string | undefined;
  localizationDataUnits: { [key: string]: string } = {};

  constructor(
    private store: StoreService,
    private messageService: MessageService,
    private offerService: OfferService,
    private orderService: OrderService,
    private storeService: StoreService,
    private localizeService: LocalizeService
  ) {}

  ngOnInit(): void {
    this.loadingOrders = true; // Start loading
    this.storeService.selectedCompanyContext$.subscribe({
      next: (company) => {
        if (company && company.id) {
          this.companyId = company.id;
        } else {
          console.error('No company selected or company ID is missing');
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Keine Firma ausgewählt oder Firmen-ID fehlt' });
        }
      },
      error: (error) => {
        console.error('Error fetching company context:', error);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Abrufen des Firmenkontexts' });
      }
    });
    this.fetchOrdersAndRecurringOrders();
    this.loadLocalization();
  }

  // Function to fetch both orders and recurring orders
  private fetchOrdersAndRecurringOrders(): void {
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),  // Ensure there's a selected company
        switchMap(() => this.getCombinedOrders())  // Call the new combined orders function
      )
      .subscribe({
        next: ([priceRequestsData, purchaseIntentsData]) => {

          // Fetch individual price requests and purchase intents
          this.fetchIndividualRequests(priceRequestsData);
          this.fetchIndividualIntents(purchaseIntentsData);
          
          this.loadingOrders = false;  // Stop loading after data is fetched
        },
        error: (error) => {
          this.loadingOrders = false;  // Stop loading on error
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellungen konnten nicht geladen werden' });
          console.error('Error loading orders and recurring orders:', error);
        }
      });
  }

  // Combined function to get orders, recurring orders, price requests, and purchase intents
  private getCombinedOrders(): Observable<[string[], string[]]> {
    const priceRequests$ = this.offerService.getPriceRequests();
    const purchaseIntents$ = this.offerService.getPurchaseIntents();
    return forkJoin([priceRequests$, purchaseIntents$]);
  }

  // Fetch individual price requests from URLs
  private fetchIndividualRequests(requestUrls: string[]): void {
    if (requestUrls.length === 0) return;
  
    const requests$ = requestUrls.map(url => this.offerService.getPriceRequestDetails(url));
    forkJoin(requests$).subscribe({
      next: (requestDetails) => {
        this.priceRequests = requestDetails;
        this.filteredPriceRequests = requestDetails; // Set filtered requests to all by default
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Preis-Anfragen konnten nicht geladen werden' });
        console.error('Error fetching price requests:', error);
      }
    });
  }
  
  // Fetch individual purchase intents from URLs
  private fetchIndividualIntents(intentUrls: string[]): void {
    if (intentUrls.length === 0) return;
  
    const intents$ = intentUrls.map(url => this.offerService.getPurchaseIntentDetails(url));
    forkJoin(intents$).subscribe({
      next: (intentDetails) => {
        this.purchaseIntents = intentDetails;
        this.filteredPurchaseIntents = intentDetails; // Set filtered intents to all by default
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsichten konnten nicht geladen werden' });
        console.error('Error fetching purchase intents:', error);
      }
    });
  }

  // Fetch details and related information (offer, category, buyingCompany, sellingCompany) for a Price Request
  fetchPriceRequestDetails(url: string): void {
    this.clearSelected()
    this.loadingDialog = true
    this.offerService.getPriceRequestDetails(url).subscribe({
      next: (details) => {
        const { links } = details;

        const relatedRequests = {
          offer$: this.offerService.getRelatedDetail(links.offer),
          category$: this.offerService.getRelatedDetail(links.category),
          buyingCompany$: this.offerService.getRelatedDetail(links.buyingCompany),
          sellingCompany$: this.offerService.getRelatedDetail(links.sellingCompany)
        };

        // Fetch all related details using forkJoin
        forkJoin(relatedRequests).subscribe({
          next: (relatedData) => {
            this.selectedPriceRequest = {
              ...details,
              offer: relatedData.offer$,
              category: relatedData.category$,
              buyingCompany: relatedData.buyingCompany$,
              sellingCompany: relatedData.sellingCompany$
            };
            this.loadingDialog = false
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Verknüpfte Daten konnten nicht geladen werden' });
            console.error('Error fetching related details:', error);
            this.loadingDialog = false
          }
        });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Preis-Anfrage Details konnten nicht geladen werden' });
        console.error('Error fetching price request details:', error);
        this.loadingDialog = false
      }
    });
  }

  // Fetch details and related information (offer, category, buyingCompany, sellingCompany) for a Purchase Intent
  fetchPurchaseIntentDetails(url: string): void {
    this.clearSelected()
    this.loadingDialog = true;
    this.offerService.getPurchaseIntentDetails(url).subscribe({
      next: (details) => {
        const { links } = details;

        const relatedRequests = {
          offer$: this.offerService.getRelatedDetail(links.offer),
          category$: this.offerService.getRelatedDetail(links.category),
          buyingCompany$: this.offerService.getRelatedDetail(links.buyingCompany),
          sellingCompany$: this.offerService.getRelatedDetail(links.sellingCompany)
        };

        // Fetch all related details using forkJoin
        forkJoin(relatedRequests).subscribe({
          next: (relatedData) => {
            this.selectedPurchaseIntent = {
              ...details,
              offer: relatedData.offer$,
              category: relatedData.category$,
              buyingCompany: relatedData.buyingCompany$,
              sellingCompany: relatedData.sellingCompany$
            };
            this.loadingDialog = false
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Verknüpfte Daten konnten nicht geladen werden' });
            console.error('Error fetching related details:', error);
            this.loadingDialog = false
          }
        });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht Details konnten nicht geladen werden' });
        console.error('Error fetching purchase intent details:', error);
        this.loadingDialog = false
      }
    });
  }

  // Clear the selected price request or purchase intent
  clearSelected(): void {
    this.selectedPriceRequest = null;
    this.selectedPurchaseIntent = null;
  }

    // Filter Price Requests based on status
    filterPriceRequests(): void {
      if (this.selectedPriceRequestStatus) {
        this.filteredPriceRequests = this.priceRequests.filter(
          (request) => request.status === this.selectedPriceRequestStatus
        );
      } else {
        // Show all price requests if "All" is selected
        this.filteredPriceRequests = this.priceRequests;
      }
    }
    
    // Filter Purchase Intents based on status
    filterPurchaseIntents(): void {
      if (this.selectedPurchaseIntentStatus) {
        this.filteredPurchaseIntents = this.purchaseIntents.filter(
          (intent) => intent.status === this.selectedPurchaseIntentStatus
        );
      } else {
        // Show all purchase intents if "All" is selected
        this.filteredPurchaseIntents = this.purchaseIntents;
      }
    }
    makePurchaseIntentOrder() {
      console.log("Will turn purchase intent into an order for ", this.selectedPurchaseIntent);
    
      // Ensure we have a selected purchase intent with the required status
      if (!this.selectedPurchaseIntent || this.selectedPurchaseIntent.status !== 'ACCEPTED') {
        console.error("No valid purchase intent selected or purchase intent is not in ACCEPTED status");
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht wurde nicht ausgewählt oder ist noch nicht im AKZEPTIERT Status'});
        return;
      }
    
      const { buyingCompany, sellingCompany } = this.selectedPurchaseIntent;
    
      // Function to fetch the MAIN address for a company
      const fetchMainAddress = (company: { addresses: any[] }) => {
        if (company && company.addresses && company.addresses.length > 0) {
          const mainAddressUrl = company.addresses.find((addr: { type: string }) => addr.type === 'MAIN')?.self;
          if (mainAddressUrl) {
            return this.offerService.getRelatedDetail(mainAddressUrl); // Fetch the address details
          }
        }
        return of(null); // Return null if no MAIN address found
      };
    
      // Fetch the MAIN address for both buying and selling company
      forkJoin({
        buyingCompanyMainAddress: fetchMainAddress(buyingCompany),
        sellingCompanyMainAddress: fetchMainAddress(sellingCompany)
      }).subscribe({
        next: (addresses) => {
          console.log("Buying Company MAIN Address: ", addresses.buyingCompanyMainAddress);
          console.log("Selling Company MAIN Address: ", addresses.sellingCompanyMainAddress);
    
          // Ensure addresses have all required fields (fill empty fields if necessary)
          const invoiceAddress = {
            type: 'INVOICE',
            name: addresses.buyingCompanyMainAddress?.name || 'fallback Name',
            street: addresses.buyingCompanyMainAddress?.street || 'fallback Street',
            zipcode: addresses.buyingCompanyMainAddress?.zipcode || '00000',
            city: addresses.buyingCompanyMainAddress?.city || 'fallback City'
          };

          const deliveryAddress = {
            type: 'DELIVERY',
            name: addresses.sellingCompanyMainAddress?.name || 'fallback Name',
            street: addresses.sellingCompanyMainAddress?.street || 'fallback Street',
            zipcode: addresses.sellingCompanyMainAddress?.zipcode || '00000',
            city: addresses.sellingCompanyMainAddress?.city || 'fallback City'
          };

          // Prepare the order payload
          const orderPayload = {
            invoiceAddress: invoiceAddress,
            deliveryAddress: deliveryAddress,
            paymentType: 'ON_ACCOUNT' // Assuming "ON_ACCOUNT" as the payment type
          };
    
          // Extract the purchaseIntentId from the full URL
          const purchaseIntentId = this.selectedPurchaseIntent.links.self.split('/').pop(); // Extract the UUID
    
          // Send the POST request to turn the purchase intent into an order
          this.orderService.turnPurchaseIntentIntoOrder(purchaseIntentId, orderPayload)
            .subscribe({
              next: (response: any) => {
                console.log('Order created successfully:', response);
                this.messageService.add({ severity: 'success', summary: 'Bestellung wurde erstellt', detail: 'Kaufabsicht wurde erfolgreich bestellt.' });
              },
              error: (error: any) => {
                console.error('Error turning purchase intent into an order:', error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellung konnte nicht erstellt werden.' });
              }
            });
        },
        error: (error) => {
          console.error("Error fetching main addresses: ", error);
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Hauptadressen konnten nicht abgerufen werden'});
        }
      });
    }
    makePriceRequestOrder() {
      console.log("Will turn price request into an order for ", this.selectedPriceRequest);
    
      // Ensure we have a selected price request with the required status
      if (!this.selectedPriceRequest || this.selectedPriceRequest.status !== 'PRICE_ADDED') {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Kein gültiger Preis ausgewählt'});
        console.error("No valid price request selected or price request is not in PRICE_ADDED status");
        return;
      }
    
      const { buyingCompany, sellingCompany } = this.selectedPriceRequest;
    
      // Function to fetch the MAIN address for a company
      const fetchMainAddress = (company: { addresses: any[] }) => {
        if (company && company.addresses && company.addresses.length > 0) {
          const mainAddressUrl = company.addresses.find((addr: { type: string }) => addr.type === 'MAIN')?.self;
          if (mainAddressUrl) {
            return this.offerService.getRelatedDetail(mainAddressUrl); // Fetch the address details
          }
        }
        return of(null); // Return null if no MAIN address found
      };
    
      // Fetch the MAIN address for both buying and selling company
      forkJoin({
        buyingCompanyMainAddress: fetchMainAddress(buyingCompany),
        sellingCompanyMainAddress: fetchMainAddress(sellingCompany)
      }).subscribe({
        next: (addresses) => {
          console.log("Buying Company MAIN Address: ", addresses.buyingCompanyMainAddress);
          console.log("Selling Company MAIN Address: ", addresses.sellingCompanyMainAddress);
    
          // Ensure addresses have all required fields (fill empty fields if necessary)
          const invoiceAddress = {
            type: 'INVOICE',
            name: addresses.buyingCompanyMainAddress?.name || 'fallback Name',
            street: addresses.buyingCompanyMainAddress?.street || 'fallback Street',
            zipcode: addresses.buyingCompanyMainAddress?.zipcode || '00000',
            city: addresses.buyingCompanyMainAddress?.city || 'fallback City'
          };
    
          const deliveryAddress = {
            type: 'DELIVERY',
            name: addresses.sellingCompanyMainAddress?.name || 'fallback Name',
            street: addresses.sellingCompanyMainAddress?.street || 'fallback Street',
            zipcode: addresses.sellingCompanyMainAddress?.zipcode || '00000',
            city: addresses.sellingCompanyMainAddress?.city || 'fallback City'
          };
    
          // Prepare the order payload
          const orderPayload = {
            invoiceAddress: invoiceAddress,
            deliveryAddress: deliveryAddress,
            paymentType: 'ON_ACCOUNT' // Assuming "ON_ACCOUNT" as the payment type
          };
    
          // Extract the priceRequestId from the full URL
          const priceRequestId = this.selectedPriceRequest.links.self.split('/').pop(); // Extract the UUID
    
          // Send the POST request to turn the price request into an order
          this.orderService.addOrderToPriceRequest(priceRequestId, orderPayload)
            .subscribe({
              next: (response: any) => {
                console.log('Order created successfully:', response);
                this.messageService.add({ severity: 'success', summary: 'Bestellung wurde erstellt', detail: 'Preisanfrage wurde erfolgreich in eine Bestellung konvertiert.' });
              },
              error: (error: any) => {
                console.error('Error turning price request into an order:', error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellung konnte nicht erstellt werden.' });
              }
            });
        },
        error: (error) => {
          this.messageService.add({severity:'error', summary: 'Fehler', detail: 'Hauptadressen konnten nicht abgerufen werden'})
          console.error("Error fetching main addresses: ", error);
        }
      });
    }

    openPriceOfferDialog() {
      if (!this.selectedPriceRequest) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a price request first.' });
        return;
      }
      this.totalPrice = null;
      this.calculatedPricePerUnit = null;
      this.priceOfferDialogVisible = true;
    }
  
    // Method to close the price offer dialog
    closePriceOfferDialog() {
      this.priceOfferDialogVisible = false;
      this.resetPriceOfferForm();
    }
  
    // Method to reset the price offer form
    resetPriceOfferForm() {
      this.totalPrice = null;
      this.calculatedPricePerUnit = null;
    }
  
    // Method to calculate price per unit when total price changes
    calculatePricePerUnit(): void {
      if (this.totalPrice && this.selectedPriceRequest) {
        const amountInKg = this.selectedPriceRequest.amount.amount;
        this.calculatedPricePerUnit = this.totalPrice / amountInKg;
      }
    }

    acceptPurchaseIntend()
    {
      console.log("kaufanfrage annehmen ", this.selectedPurchaseIntent);
    
      // Ensure we have a selected purchase intent with the required status
      if (!this.selectedPurchaseIntent || this.selectedPurchaseIntent.status !== 'PENDING') {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Keine gültige Kaufabsicht ausgewählt'})
        console.error("No valid purchase intent selected or purchase intent is not in PENDING status");
        return;
      }
      const priceRequestId = this.selectedPurchaseIntent.links.self.split('/').pop(); // Extract the UUID
      this.orderService.updatePurchaseIntentStatus(priceRequestId, "ACCEPTED").subscribe({
        next: (response: any) => {
          console.log('Purchase intent accepted successfully:', response);
          this.messageService.add({ severity: 'success', summary: 'Kaufabsicht angenommen', detail: 'Die Kaufabsicht wurde erfolgreich angenommen.'});
        },
        error: (error: any) => {
          console.error('Error accepting purchase intent:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht konnte nicht angenommen werden'});
        }
      })
    }
    declinePurchaseIntend(){
      console.log("kaufanfrage ablehnen ", this.selectedPurchaseIntent);
    
      // Ensure we have a selected purchase intent with the required status
      if (!this.selectedPurchaseIntent || this.selectedPurchaseIntent.status !== 'PENDING') {
        console.error("No valid purchase intent selected or purchase intent is not in PENDING status");
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Keine gültige Kaufabsicht ausgewählt'})
        return;
      }
      const priceRequestId = this.selectedPurchaseIntent.links.self.split('/').pop(); // Extract the UUID
      this.orderService.updatePurchaseIntentStatus(priceRequestId, "REJECTED").subscribe({
        next: (response: any) => {
          console.log('Purchase intent declined successfully:', response);
          this.messageService.add({ severity: 'success', summary: 'Kaufabsicht abgelehnt', detail: 'Kaufabsicht wurde erfolgreich abgelehnt' });
        },
        error: (error: any) => {
          console.error('Error declining purchase intent:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht konnte nicht abgelehnt werden' });
        }
      })
    }

    declinePriceRequest(){
      console.log("Preisanfrage ablehnen ", this.selectedPriceRequest);
    
      // Ensure we have a selected purchase intent with the required status
      console.log(this.selectedPriceRequest)
      if (!this.selectedPriceRequest) {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Keine gültige Preisanfrage ausgewählt'})
        return;
      }
     //we have export type PriceRequestStatus = "PENDING" | "PRICE_ADDED" | "COMPLETED" | "CANCELED_BY_BUYER" | "CANCELED_BY_SELLER" | "REJECTED";
      const priceRequestId = this.selectedPriceRequest.links.self.split('/').pop(); // Extract the UUID
      this.orderService.updatePriceRequestStatus(priceRequestId, 'REJECTED').subscribe({
        next: (response: any) => {
          console.log('Purchase intent declined successfully:', response);
          this.messageService.add({ severity: 'success', summary: 'Preisanfrage abgelehnt', detail: 'Preisanfrage wurde erfolgreich abgelehnt' });
        },
        error: (error: any) => {
          console.error('Error declining purchase intent:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Preisanfrage konnte nicht abgelehnt werden' });
        }
      })
    }
    
      // Watch for changes in total price and update price per unit
  ngOnChanges(): void {
    this.calculatePricePerUnit();
  }

  // Method to make a price offer for a selected price request
  makePriceOffer() {
    if (!this.selectedPriceRequest || !this.totalPrice) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a total price.' });
      return;
    }

    // Calculate price per unit
    const amountInKg = this.selectedPriceRequest.amount.amount;
    const pricePerUnit = this.totalPrice / amountInKg;

    // Prepare payload
    const offerPayload = {
      status: 'PRICE_ADDED',
      pricePerUnit: pricePerUnit
    };

    const priceRequestId = this.selectedPriceRequest.links.self.split('/').pop(); // Extract the UUID

    this.orderService.setPriceForPriceRequest(priceRequestId, pricePerUnit, 'PRICE_ADDED')
      .subscribe({
        next: (response: any) => {
          console.log('Price offer set successfully:', response);
          this.messageService.add({ severity: 'success', summary: 'Price Set', detail: 'The price has been set successfully.' });
          this.closePriceOfferDialog(); // Close the dialog after success
        },
        error: (error: any) => {
          console.error('Error setting price:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to set the price.' });
        }
      });
  }

  // Helper function to check if the user is the buyer
  isBuyer(data: any): boolean {
    if (!this.companyId || !data || !data.buyingCompany) {
      return false;
    }
    return data.buyingCompany.id === this.companyId;
  }

  // Helper function to check if the user is the seller
  isSeller(data: any): boolean {
    if (!this.companyId || !data || !data.sellingCompany) {
      return false;
    }
    return data.sellingCompany.id === this.companyId;
  }
  getStatusLabel(status: string, type: 'priceRequest' | 'purchaseIntent'): string {
    const statuses = type === 'priceRequest' ? this.priceRequestStatuses : this.purchaseIntentStatuses;
    const statusObj = statuses.find((item) => item.value === status);
    return statusObj ? statusObj.label : status; // If no match, return status as fallback
  }
  loadLocalization()
  {
    this.localizeService.getUnits().subscribe({
      next: (result) => {
        this.localizationDataUnits = result; // Save localization data for later use
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Übersetzungen',
        });
      },
    });
  }
  getLocalizedLabelUnit(unit: string): string {
    if (!unit || !this.localizationDataUnits) {
      return unit; // Return original value if no translation is available or input is empty
    }

    // Split by commas and trim each label
    const labels = unit.split(',').map((label) => label.trim());

    // Translate each label individually, falling back to the original label if no translation is found
    const translatedLabels = labels.map(
      (label) => this.localizationDataUnits[label] || label,
    );

    // Join the translated labels back with a comma separator
    return translatedLabels.join(', ');
  }
}