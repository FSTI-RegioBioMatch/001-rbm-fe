import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferService } from '../../../shared/services/offer.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { OfferType } from '../../../shared/types/offer.type';
import { DialogModule } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { CompanyService } from '../../../shared/services/company.service';
import { CompanyType } from '../../../shared/types/company.type';

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
  filteredCompanies: CompanyType[] = [];
  selectedOffer: OfferType | null = null;
  selectedCompany: CompanyType | null = null;
  displayDialog: boolean = false;
  offers: OfferType[] = [];
  companies: CompanyType[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private companyService: CompanyService,
    private offerService: OfferService, 
    private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.subscription.add(
      this.companyService.companies$.subscribe((companies) => {
        this.companies = companies;
      })
    );
    this.subscription.add(
      this.offerService.offers$.subscribe((offers) => {
        this.offers = offers;
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
    this.filteredCompanies = this.companies.filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.filteredOffers = this.offers.filter((offer) =>
      offer.ontoFoodType?.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  showDetailsCompany(company: CompanyType): void {
    console.log('Details:', company);
    this.selectedCompany = company;
    this.selectedOffer = null;
    this.displayDialog = true;
    this.cdr.detectChanges();
  }

  showDetailsOffer(offer: OfferType): void {
    console.log('Details:', offer);
    this.selectedOffer = offer;
    this.selectedCompany = null;
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
