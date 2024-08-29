import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OfferService } from '../../../shared/services/offer.service';
import { JsonPipe, NgIf, NgFor } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { OfferType } from '../../../shared/types/offer.type';
import { Subscription } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-near-offers-card',
  standalone: true,
  imports: [JsonPipe, CardModule, DialogModule, NgIf, NgFor, PaginatorModule],
  templateUrl: './near-offers-card.component.html',
  styleUrls: ['./near-offers-card.component.scss'],
})
export class NearOffersCardComponent implements OnInit {
  displayDialog: boolean = false;
  selectedOffer: OfferType | null = null;
  offers: OfferType[] = [];
  private subscription: Subscription = new Subscription();
  paginatedOffers: any[] = [];
  itemsPerPage: number = 5;
  currentPage: number = 0;

  constructor(
    public offerService: OfferService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.offerService.offers$.subscribe((offers) => {
        this.offers = offers;
        this.updatePaginatedOffers(this.currentPage * this.itemsPerPage);
        this.cdr.detectChanges();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updatePaginatedOffers(startIndex: number) {
    this.paginatedOffers = this.offers.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );
  }

  onPageChange(event: any) {
    this.currentPage = event.page;
    const startIndex = event.first;
    this.updatePaginatedOffers(startIndex);
  }

  showDetails(offer: OfferType): void {
    this.selectedOffer = offer;
    this.displayDialog = true;
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  trackByFn(index: number, item: any): any {
    return item.company.id; // or item.someUniqueIdentifier
  }

  logToConsole(message: string): void {
    console.log(message);
  }
}
