import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferService } from '../../../shared/services/offer.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { OfferType } from '../../../shared/types/offer.type';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, DialogModule, CardModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();
  filteredOffers: OfferType[] = [];
  selectedOffer: OfferType | null = null;
  displayDialog: boolean = false;
  offers: OfferType[] = [];
  private subscription: Subscription = new Subscription();

  constructor(public offerService: OfferService, private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.subscription.add(
      this.offerService.offers$.subscribe((offers) => {
        this.offers = offers;
        this.filteredOffers = offers;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.onSearchTermChange(this.searchTerm);
  }

  onSearchTermChange(searchTerm: string): void {
    console.log('Search Term', searchTerm);
    this.filteredOffers = this.offers.filter((offer) =>
      offer.ontoFoodType?.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  showDetails(offer: OfferType): void {
    console.log('Details:', offer);
    this.selectedOffer = offer;
    this.displayDialog = true;
    this.cdr.detectChanges();
  }

  logToConsole(message: string): void {
    console.log(message);
  }

  trackByFn(index: number, item: any): any {
    return item.id; // or item.someUniqueIdentifier
  }

}
