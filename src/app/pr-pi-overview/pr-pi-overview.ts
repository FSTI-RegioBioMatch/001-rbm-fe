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
    PaginatorModule,
    ToastModule
  ]
})
export class PrPiOverviewComponent implements OnInit {

  purchaseIntents: any[] = [];
  priceRequests: any[] = [];
  loadingOrders = false;
  selectedPriceRequest: any | null = null;
  selectedPurchaseIntent: any | null = null;
  currentCompany: any;
  filteredPurchaseIntents: any[] = [];
  filteredPriceRequests: any[] = [];
  selectedPurchaseIntentStatus: PurchaseIntentStatus | null = null;
  selectedPriceRequestStatus: PriceRequestStatus | null = null;


  priceRequestStatuses = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Price Added', value: 'PRICE_ADDED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Canceled by Buyer', value: 'CANCELED_BY_BUYER' },
    { label: 'Canceled by Seller', value: 'CANCELED_BY_SELLER' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  purchaseIntentStatuses = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Canceled by Buyer', value: 'CANCELED_BY_BUYER' },
    { label: 'Canceled by Seller', value: 'CANCELED_BY_SELLER' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  constructor(
    private store: StoreService,
    private messageService: MessageService,
    private offerService: OfferService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadingOrders = true; // Start loading
    this.fetchOrdersAndRecurringOrders();
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
            console.log(this.selectedPriceRequest)
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Verknüpfte Daten konnten nicht geladen werden' });
            console.error('Error fetching related details:', error);
          }
        });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Preis-Anfrage Details konnten nicht geladen werden' });
        console.error('Error fetching price request details:', error);
      }
    });
  }

  // Fetch details and related information (offer, category, buyingCompany, sellingCompany) for a Purchase Intent
  fetchPurchaseIntentDetails(url: string): void {
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
            console.log(this.selectedPurchaseIntent)
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Verknüpfte Daten konnten nicht geladen werden' });
            console.error('Error fetching related details:', error);
          }
        });
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht Details konnten nicht geladen werden' });
        console.error('Error fetching purchase intent details:', error);
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
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht wurde nicht ausgewählt oder ist noch nicht im AKZEPTIERT Status'})
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
            type: 'INVOICE',
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
            type: 'INVOICE',
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

    makePriceOffer(){}

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
          this.messageService.add({ severity: 'success', summary: 'Purchase Intent accepted', detail: 'The purchase intent has been accepted successfully.' });
        },
        error: (error: any) => {
          console.error('Error accepting purchase intent:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to accept the purchase intent.' });
        }
      })
    }
    declinePurchaseIntend(){
      console.log("kaufanfrage ablehnen ", this.selectedPurchaseIntent);
    
      // Ensure we have a selected purchase intent with the required status
      if (!this.selectedPurchaseIntent || this.selectedPurchaseIntent.status !== 'PENDING') {
        console.error("No valid purchase intent selected or purchase intent is not in PENDING status");
        return;
      }
      const priceRequestId = this.selectedPurchaseIntent.links.self.split('/').pop(); // Extract the UUID
      this.orderService.updatePurchaseIntentStatus(priceRequestId, "REJECTED").subscribe({
        next: (response: any) => {
          console.log('Purchase intent declined successfully:', response);
          this.messageService.add({ severity: 'success', summary: 'Purchase Intent Declined', detail: 'The purchase intent has been declined successfully.' });
        },
        error: (error: any) => {
          console.error('Error declining purchase intent:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to decline the purchase intent.' });
        }
      })
    }
}
