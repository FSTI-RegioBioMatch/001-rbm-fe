import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../shared/services/order.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Button  } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [ToastModule, DatePipe, TableModule, CommonModule, Button, RouterLink],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [MessageService]
})
export class OrdersComponent implements OnInit {
  orders: any[] = []; // Store the order details here
  orderIds: string[] = []; // Store the extracted order IDs here

  constructor(
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Fetch the company orders which returns an array of order URLs
    this.orderService.getCompanyOrders().subscribe({
      next: (orderUrls) => {
        console.log('Order URLs:', orderUrls);
        
        // Extract the order IDs from the URLs
        this.orderIds = orderUrls.map((url: string) => this.extractOrderIdFromUrl(url));
        
        console.log('Extracted Order IDs:', this.orderIds);

        // Fetch order details for each extracted order ID
        this.fetchAllOrderDetails(this.orderIds);
      },
      error: (error) => {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Bestellungen des Unternehmens konnten nicht abgerufen werden'});
        console.error('Error fetching company orders:', error);
      }
    });
  }

  // Function to extract the order ID from the URL
  private extractOrderIdFromUrl(orderUrl: string): string {
    return orderUrl.split('/').pop() || '';
  }

  // Function to fetch the details for all orders by ID
  private fetchAllOrderDetails(orderIds: string[]): void {
    const orderDetailRequests = orderIds.map((orderId) =>
      this.orderService.getOrderById(orderId).pipe(
        catchError((error) => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Fehler beim Abrufen der Bestellungen'});
          console.error(`Error fetching order ${orderId}:`, error);
          return of(null); // Return null or an empty object if the request fails
        })
      )
    );

    // Using forkJoin to wait for all requests to complete, including the ones that fail
    forkJoin(orderDetailRequests).subscribe({
      next: (orderDetails) => {
        // Filter out any failed (null) responses
        this.orders = orderDetails.filter(order => order !== null);
        console.log('Order Details:', this.orders);
      },
      error: (error) => {
        this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Bestellungsdetails konnten nicht abgerufen werden'});
        console.error('Error fetching order details:', error);
      }
    });
  }
}
