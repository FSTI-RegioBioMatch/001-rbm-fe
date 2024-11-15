import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { PixabayService } from '../../../shared/services/pixabay.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HistoryOfferService} from '../../../shared/services/history-offer.service';
import { HistoricProductType } from '../../../shared/types/historicproduct.type';
import { StoreService } from '../../../shared/store/store.service'; 
import { AddressType } from '../../../shared/types/address.type';
import { DialogModule } from 'primeng/dialog';
import { of, switchMap, Observable } from 'rxjs';

interface Season {
  name: string;
  months: number[];
}

interface Product {
  productName: string;
  offers: Offer[];
  imageUrl?: string;
}

interface Offer {
  company: {
    label: string;
    city: string;
  }
  links: {
    company: string;
    offer: string;
    address: string;
  }
  product: {
    isPermanent: boolean;    
    dateStart: string;
    dateEnd: string;
  }
}

@Component({
  selector: 'app-seasonal-calendar',
  standalone: true,
  imports: [DropdownModule, FormsModule, CommonModule, DialogModule],
  templateUrl: './seasonal-calendar.component.html',
  styleUrls: ['./seasonal-calendar.component.scss'],
})

export class SeasonalCalendarComponent implements OnInit {

  seasons: { label: string, value: Season } [] = [
    { label: 'Frühling', value: { name: 'spring', months: [2, 3, 4] } },
    { label: 'Sommer', value: { name: 'summer', months: [5, 6, 7] } },
    { label: 'Herbst', value: { name: 'autumn', months: [8, 9, 10] } },
    { label: 'Winter', value: { name: 'winter', months: [11, 0, 1] } },
  ];
  selectedSeason: Season = this.seasons[0].value;
  currentSeason: Season = this.seasons[0].value;

  productsHistory: HistoricProductType[] = [];
  products: Product[] = []
  filteredProducts: Product[] = []
  filteredOffers: Product[] = []
  selectedProduct: Product | null = null;

  loaded = false;
  displayDialog: boolean = false;

  defaultImageUrl: string = '';

  constructor(
    private pixabayService: PixabayService,
    private router: Router,
    private http: HttpClient,
    private historyOfferService: HistoryOfferService, 
    private cdr: ChangeDetectorRef,
    private store: StoreService // Inject StoreService
  ) {}

  ngOnInit(): void {
    this.setUpDefaultImage();
    this.setCurrentSeason();
    this.getProductHistory();
  }
  
  ngOnDestroy(): void {
    // unsubscibe() needed
  }

  getProductHistory() {
    this.store.selectedCompanyContext$.subscribe(company => {
      if (company && company.addresses && company.addresses.length > 0) {
        const addressUrl = company.addresses[0].self; // Use the first address
        this.historyOfferService.getAddress(addressUrl).subscribe((address: AddressType) => {
          const searchRadiusInKM = 50; // Adjust the search radius as needed
          this.historyOfferService.setProductsBySearchCriteria(searchRadiusInKM, address);
        });
      }
    });

    // this.store.selectedCompanyContext$.pipe(
    //   switchMap((company) => {
    //     if (company && company.addresses && company.addresses.length > 0) {
    //       const addressUrl = company.addresses[0].self; // Get the first address URL
    //       return this.historyOfferService.getAddress(addressUrl);
    //     } else {
    //       return of(null);
    //     }
    //   }),
    //   switchMap((address: AddressType | null, index: number): Observable<null> => {
    //     if (address) {
    //       const searchRadiusInKM = 50; // Set the search radius
    //       this.historyOfferService.setProductsBySearchCriteria(searchRadiusInKM, address);
    //       return of(null);
    //     } else {
    //       return of(null);
    //     }
    //   })
    // ).subscribe(result => { // change for tap()
    //   // console.log(result);
    // });

    // Subscribe to the loaded observable to update the loading state
    this.historyOfferService.loaded$.subscribe(loaded => {
      this.loaded = loaded;
      if (loaded)
        this.updateProduceList();
    });
  }

  updateProduceList() {
    this.historyOfferService.products$.subscribe((products) => {
      this.productsHistory = products;
      console.log(products);
      this.productsHistory.forEach((item) => {
        const productLabel = item?.ontoFoodType?.label;
        if (productLabel) {
          const query = this.sanitiseQuery(productLabel);
          this.addOffer(item, query);
        }
      })
    });

    this.historyOfferService.loaded$.subscribe(loaded => {
      this.loaded = loaded;
      if (loaded)
        this.updateOutputList();
    });
  }

  addOffer(item: HistoricProductType, query: string): void {
    let product = this.products.find(p => p.productName === query);

    if (!product) {
      this.products.push({productName: query, offers: []});
    }

    product?.offers.push({company: {
                            label: item.company.label,
                            city: item.address.city,
                          },
                          links: {
                            company: item.links.company,
                            offer: item.links.offer,
                            address: item.links.address,
                          },
                          product: {
                            dateStart: item?.product?.dateStart,
                            dateEnd: item?.product?.dateEnd,
                            isPermanent: item?.product?.isPermanent
                          }
      });
  }

  updateOutputList() {
    this.filterOffersBySeason(this.selectedSeason.name);
    // this.filterProductsBySeason(this.selectedSeason.name);
    this.loadImagesForProduce();
    console.log('amount of items ', this.filteredProducts.length);
  }

  // filterProductsBySeason(season: string): void {
  //   const now = new Date();
  //   this.filteredProducts = this.products.filter(product => {
  //     for (let i = 0; i < product.offers.length; i++) {
  //       if (product.offers[i].product.isPermanent) {
  //         return true; // Always available
  //       }
  
  //       const dateStart = this.parseDate(product.offers[i].product.dateStart);
  //       const dateEnd = this.parseDate(product.offers[i].product.dateEnd);
  
  //       if (!dateStart || !dateEnd) {
  //         return false; // Skip products with invalid or null dates
  //       }
  
  //       switch (season) {
  //         case 'spring':
  //           return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 2, 21), new Date(now.getFullYear(), 5, 20));
  //         case 'summer':
  //           return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 5, 21), new Date(now.getFullYear(), 8, 22));
  //         case 'autumn':
  //           return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 8, 23), new Date(now.getFullYear(), 11, 20));
  //         case 'winter':
  //           return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 11, 21), new Date(now.getFullYear() + 1, 2, 20));
  //         default:
  //           return false;
  //       }
  //     }
  //     return false;
  //   });
  // }
  filterOffersBySeason(season: string): void {
    const now = new Date();
    this.filteredOffers = []; // Reset the filtered offers array

    this.products.forEach(product => {
        // Filter the offers for the product based on the season
        const filteredOffers = product.offers.filter(offer => {
            if (offer.product.isPermanent) {
                return true; // Always include permanent offers
            }

            const dateStart = this.parseDate(offer.product.dateStart);
            const dateEnd = this.parseDate(offer.product.dateEnd);

            if (!dateStart || !dateEnd) {
                return false; // Exclude offers with invalid or null dates
            }

            switch (season) {
                case 'spring':
                    return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 2, 21), new Date(now.getFullYear(), 5, 20));
                case 'summer':
                    return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 5, 21), new Date(now.getFullYear(), 8, 22));
                case 'autumn':
                    return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 8, 23), new Date(now.getFullYear(), 11, 20));
                case 'winter':
                    return this.isDateInRange(dateStart, dateEnd, new Date(now.getFullYear(), 11, 21), new Date(now.getFullYear() + 1, 2, 20));
                default:
                    return false;
            }
        });

        // If the product has valid offers, add it to the filteredOffers array
        if (filteredOffers.length > 0) {
            this.filteredOffers.push({
                ...product,
                offers: filteredOffers
            });
        }
    });
}

  loadImagesForProduce() {
    this.filteredOffers.forEach((product) => {
      this.pixabayService.searchImage(product.productName).subscribe({
        next: (response: any) => {
          if (response.hits && response.hits.length > 0) {
            product.imageUrl = response.hits[0].webformatURL;  // Set the first image URL
          } else {
            product.imageUrl = this.defaultImageUrl;  // No image found
            console.warn(`Kein Bild gefunden für ${product.productName}`);
          }
          },
          error: (error) => {
            console.error(`Fehler beim Abrufen des Bildes für ${product.productName}:`, error);
            product.imageUrl = '';  // In case of an error, fallback to no image
          }
      });
    });
  }

  parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  isDateInRange(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): boolean {
    // Check if the date range overlaps with the season range
    return (start <= rangeEnd && end >= rangeStart);
  }

  trackByFn(index: number, item: any): any {
    return item.company.id; // or item.someUniqueIdentifier
  }

  showDetails(produce: Product): void {
    this.selectedProduct = produce;
    this.displayDialog = true;
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  // add
  clearFilteredProducts(): void {
    this.filteredProducts = [];
  }

  capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  setCurrentSeason() {
    const currentMonth = new Date().getMonth();  // Get the current month (0 to 11)
    this.currentSeason = this.seasons.find(season =>
      season.value.months.includes(currentMonth)
    )?.value || this.seasons[0].value;

    // Set the selected season to the current season by default
    this.selectedSeason = this.currentSeason;
  }

  sanitiseQuery(query: string): string {
    const newQuery = this.capitalizeFirstLetter(query).replace(/_/g, ' ');
    return newQuery;
  }

  setUpDefaultImage() {
    this.pixabayService.searchImage('gemüse korb').subscribe({
      next: (response: any) => {
        if (response.hits && response.hits.length > 0) {
          this.defaultImageUrl = response.hits[0].webformatURL;  // Set the first image URL
        } else {
          console.warn(`Kein Bild gefunden für Standardbild`);
        }
        },
        error: (error) => {
          console.error(`Fehler beim Abrufen des Bildes für Standardbild:`, error);
        }
    });
  }
}
