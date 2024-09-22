import { Component, OnInit } from '@angular/core';
import { OrderService } from '../shared/services/order.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { OfferToOrderService } from '../shared/services/offer-to-order.service';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
  providers: [MessageService]
})
export class OrderDetailsComponent implements OnInit{
  orderId: string | null = null;
  orderDetails: any = null;
  loading: boolean = false;
  offerDetails: any = null;
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private offerToOrder: OfferToOrderService
  ){}

  ngOnInit(): void {
    console.log('Order Details Component Initialized');

    // Start loading state
    this.loading = true;

    // Extract the order ID from the route parameters, fetch the order details, then fetch offer details
    this.route.paramMap
      .pipe(
        switchMap(params => {
          this.orderId = params.get('id'); // Extract the order ID
          if (this.orderId) {
            return this.orderService.getOrderById(this.orderId); // Fetch order details using the order ID
          } else {
            // Handle case when order ID is missing in the URL
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Keine Bestell-ID in den Routenparametern gefunden.'
            });
            this.loading = false;
            return []; // Return an empty observable to stop the observable chain
          }
        }),
        switchMap(orderDetails => {
          this.orderDetails = orderDetails; // Store order details

          // Check if the offer link exists
          if (this.orderDetails?.links?.offer) {
            const offerId = this.orderDetails.links.offer.split('/').pop(); // Extract offer ID from the link
            if (offerId) {
              return this.offerToOrder.getOfferById(offerId); // Fetch offer details using the offer ID
            }
          }
          this.loading = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Warnung',
            detail: 'Keine Angebotsinformationen für diese Bestellung verfügbar.'
          });
          return []; // Return an empty observable if there's no offer link
        })
      )
      .subscribe({
        next: (offerDetails) => {
          this.offerDetails = offerDetails; // Store offer details

          this.loading = false; // Stop loading state
        },
        error: (error) => {
          console.error('Error fetching order or offer details:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Abrufen der Bestell- oder Angebotsdetails. Bitte versuchen Sie es später noch einmal.'
          });
          this.loading = false; // Stop loading state
        }
      });
  }

  getFormattedDate(date: string): string {
    return new Date(date).toLocaleString(); // Format the date to a more readable format
  }

  getAddressTypeTranslation(type: string): string {
    switch (type) {
      case 'INVOICE':
        return 'Rechnung';
      case 'DELIVERY':
        return 'Lieferung';
      case 'SELLER':
        return 'Verkäufer';
      default:
        return 'Unbekannt';
    }
  }
  
  // Method to get class based on address type for styling
  getAddressTypeClass(type: string): string {
    switch (type) {
      case 'INVOICE':
        return 'invoice-icon';
      case 'DELIVERY':
        return 'delivery-icon';
      case 'SELLER':
        return 'seller-icon';
      default:
        return '';
    }
  }

}