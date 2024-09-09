import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button'; 
import { HistoryOfferService} from '../../../../shared/services/history-offer.service';
import { HistoricProductType } from '../../../../shared/types/historicproduct.type';
import { Subscription } from 'rxjs';
import { AddressType } from '../../../../shared/types/address.type';
import { StoreService } from '../../../../shared/store/store.service'; 


@Component({
  selector: 'app-season-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, DialogModule, CardModule,
    ButtonModule],
  templateUrl: './season-calendar.component.html',
  styleUrl: './season-calendar.component.scss'
})

export class SeasonCalendarComponent {
  // loaded = false;
  // products: HistoricProductType[] = [];
  // private subscription: Subscription = new Subscription();
  // filteredProducts: HistoricProductType[] = [];
  // displayDialog: boolean = false;
  // selectedProduct: HistoricProductType | null = null;


  // constructor(
  //   private historyOfferService: HistoryOfferService, 
  //   private cdr: ChangeDetectorRef,
  //   private store: StoreService // Inject StoreService
  // ) {}


  // ngOnInit(): void {
  //     this.getProductHistory();
  //   }

  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe();
  // } 


  // getProductHistory() {
  //   this.subscription.add(
  //     this.store.selectedCompanyContext$.subscribe(company => {
  //       if (company && company.addresses && company.addresses.length > 0) {
  //         const addressUrl = company.addresses[0].self; // Use the first address
  //         this.historyOfferService.getAddress(addressUrl).subscribe((address: AddressType) => {
  //           const searchRadiusInKM = 50; // Adjust the search radius as needed
  //           this.historyOfferService.setProductsBySearchCriteria(searchRadiusInKM, address);
  //         });
  //       }
  //     })
  //   );
  
  //   // Subscribe to the products observable to update the products list
  //   this.subscription.add(
  //     this.historyOfferService.products$.subscribe((products) => {
  //       this.products = products;
  //     })
  //   );
  
  //   // Subscribe to the loaded observable to update the loading state
  //   this.historyOfferService.loaded$.subscribe(loaded => {
  //     this.loaded = loaded;
  //   });
  // }


  // filterProductsBySeason(season: string): void {
  //   const now = new Date();
  //   this.filteredProducts = this.products.filter(product => {
  //     if (product.product.isPermanent) {
  //       return true; // Always available
  //     }
  
  //     const dateStart = this.parseDate(product.product.dateStart);
  //     const dateEnd = this.parseDate(product.product.dateEnd);
  
  //     if (!dateStart || !dateEnd) {
  //       return false; // Skip products with invalid or null dates
  //     }
  
  //     switch (season) {
  //       case 'spring':
  //         return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 2, 21), new Date(now.getFullYear(), 5, 20));
  //       case 'summer':
  //         return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 5, 21), new Date(now.getFullYear(), 8, 22));
  //       case 'autumn':
  //         return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 8, 23), new Date(now.getFullYear(), 11, 20));
  //       case 'winter':
  //         return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 11, 21), new Date(now.getFullYear() + 1, 2, 20));
  //       default:
  //         return false;
  //     }
  //   });
  // }
  
  // parseDate(dateString: string): Date | null {
  //   if (!dateString) return null;
  //   const date = new Date(dateString);
  //   return isNaN(date.getTime()) ? null : date;
  // }

  // isDateInRange(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): boolean {
  //   // Check if the date range overlaps with the season range
  //   return (start <= rangeEnd && end >= rangeStart);
  // }

  // trackByFn(index: number, item: any): any {
  //   return item.company.id; // or item.someUniqueIdentifier
  // }

  // showDetails(product: HistoricProductType): void {
  //   this.selectedProduct = product;
  //   this.displayDialog = true;
  //   this.cdr.detectChanges(); // Manually trigger change detection
  // }

  // logToConsole(message: string): void {
  //   console.log(message);
  // }

  // clearFilteredProducts(): void {
  //   this.filteredProducts = [];
  // }
}
