import { Component, OnInit } from '@angular/core';
import { StoreService } from '../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { OfferService } from '../shared/services/offer.service';
import { filter, switchMap } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [MessageService],
})
export class OrdersComponent implements OnInit {

  orders: any[] = [];
  recurringOrders: any[] = [];
  loadingOrders = false;
  price_requests:  any[] = [];;

  constructor(
    private store: StoreService,
    private messageService: MessageService,
    private offerService: OfferService,
  ) { }

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
        next: ([ordersData, recurringOrdersData, price_requests]) => {
          this.orders = ordersData;
          this.recurringOrders = recurringOrdersData;
          this.price_requests = price_requests;
          this.loadingOrders = false;  // Stop loading after data is fetched
        },
        error: (error) => {
          this.loadingOrders = false;  // Stop loading on error
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders' });
          console.error('Error loading orders and recurring orders:', error);
        }
      });
  }

  // Combined function to get both orders and recurring orders
  private getCombinedOrders(): Observable<[any, any, any]> {
    const orders$ = this.offerService.getOrders();
    const recurringOrders$ = this.offerService.getRecurringOrders();
    const priceRequests$ = this.offerService.getPriceRequests();
    return forkJoin([orders$, recurringOrders$, priceRequests$]);  // Execute both calls in parallel
  }
}
