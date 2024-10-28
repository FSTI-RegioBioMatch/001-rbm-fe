import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../shared/services/order.service';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Button  } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { LocalizeService } from '../shared/services/localize.service';

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
  localizationDataUnits: { [key: string]: string } = {};
  foodDataUnits: { [key: string]: string } = {};
  orderStatuses = [
    { label: 'Alle', value: null },
    { label: 'Ausstehend', value: 'PENDING' },
    { label: 'Rechnung erstellt', value: 'INVOICE_ADDED' },
  ];
  

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private router: Router,
    private localizeService: LocalizeService,
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
        this.loadLocalization();
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
  gotoDetails(order: any) {
    console.log(order);
    const orderId = order.links.self.split('/').pop();
    this.router.navigate(["order-details", orderId])
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
      this.localizeService.getOntofood().subscribe({
        next: (result) => {
          this.foodDataUnits = result; // Save localization data for later use
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
    getStatusLabel(status: string): string {
      const statusObj = this.orderStatuses.find((item) => item.value === status);
      return statusObj ? statusObj.label : status; // If no match, return status as fallback
    }
    getLocalizedLabelFood(unit: string): string {
      if (!unit || !this.foodDataUnits) {
        return unit; // Return original value if no translation is available or input is empty
      }
  
      // Split by commas and trim each label
      const labels = unit.split(',').map((label) => label.trim());
  
      // Translate each label individually, falling back to the original label if no translation is found
      const translatedLabels = labels.map(
        (label) => this.foodDataUnits[label] || label,
      );
  
      // Join the translated labels back with a comma separator
      return translatedLabels.join(', ');
    }
}
