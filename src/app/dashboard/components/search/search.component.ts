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
import { StoreService } from '../../../shared/store/store.service'; 
import { AddressType } from '../../../shared/types/address.type';

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
  loaded = false;

  constructor(
    private companyService: CompanyService,
    private offerService: OfferService, 
    private cdr: ChangeDetectorRef,
    private store: StoreService // Inject StoreService
  ) {}
  
  ngOnInit(): void {
    this.getCompanies();
    
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


  getCompanies() {
    this.subscription.add(
      this.store.selectedCompanyContext$.subscribe(company => {
        if (company && company.addresses && company.addresses.length > 0) {
          const addressUrl = company.addresses[0].self; // Use the first address
          this.companyService.getAddress(addressUrl).subscribe((address: AddressType) => {
            const searchRadiusInKM = 50; // Adjust the search radius as needed
            this.companyService.setCompaniesBySearchCriteria(searchRadiusInKM, address);
          });
        }
      })
    );
  
    this.subscription.add(
    this.companyService.companies$.subscribe(companies => {
      this.companies = companies;
    })
  );


    this.companyService.loaded$.subscribe(loaded => {
      this.loaded = loaded;
    });
  } 
  
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.onSearchTermChange(this.searchTerm);
  }

  onSearchTermChange(searchTerm: string): void {
    if (searchTerm.trim() === '') {
      this.filteredCompanies = [];
      this.filteredOffers = [];
    } else {
      this.filteredCompanies = this.companies.filter((company) =>
        company.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.filteredOffers = this.offers.filter((offer) =>
        offer.ontoFoodType?.label?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  showDetailsCompany(company: CompanyType): void {
    this.selectedCompany = company;
    this.selectedOffer = null;
    this.displayDialog = true;
    this.cdr.detectChanges();
  }

  showDetailsOffer(offer: OfferType): void {
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
