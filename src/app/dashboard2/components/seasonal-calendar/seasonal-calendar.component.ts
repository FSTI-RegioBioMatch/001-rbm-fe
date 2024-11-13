import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { CommonModule, JsonPipe } from '@angular/common';
import { PixabayService } from '../../../shared/services/pixabay.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HistoryOfferService} from '../../../shared/services/history-offer.service';
import { HistoricProductType } from '../../../shared/types/historicproduct.type';
import { StoreService } from '../../../shared/store/store.service'; 
import { AddressType } from '../../../shared/types/address.type';
import { of, switchMap, Observable } from 'rxjs';

interface Season {
  name: string;
  months: number[];
}

interface Produce {
  name: string;
  imageUrl?: string;
  // links?
  dateStart: string;
  dateEnd: string;
  isPermanent: boolean;
}

@Component({
  selector: 'app-seasonal-calendar',
  standalone: true,
  imports: [DropdownModule, TableModule, FormsModule, JsonPipe, CommonModule],
  templateUrl: './seasonal-calendar.component.html',
  styleUrls: ['./seasonal-calendar.component.scss'],
})

export class SeasonalCalendarComponent implements OnInit {
  months!: SelectItem[];
  selectedMonth: number = new Date().getMonth();

  // seasons: Season[] = [
  //   { name: 'spring', months: [2, 3, 4] },
  //   { name: 'summer', months: [5, 6, 7] },
  //   { name: 'autumn', months: [8, 9, 10] },
  //   { name: 'winter', months: [11, 0, 1] },
  // ]
  seasons: { label: string, value: Season }[] = [
    { label: 'Spring', value: { name: 'spring', months: [2, 3, 4] } },
    { label: 'Summer', value: { name: 'summer', months: [5, 6, 7] } },
    { label: 'Autumn', value: { name: 'autumn', months: [8, 9, 10] } },
    { label: 'Winter', value: { name: 'winter', months: [11, 0, 1] } },
  ];
  selectedSeason: Season = this.seasons[0].value;
  currentSeason: Season = this.seasons[0].value;

  loaded = false;
  products: HistoricProductType[] = [];
  filteredProducts: HistoricProductType[] = [];
  displayDialog: boolean = false;
  selectedProduct: HistoricProductType | null = null;

  outputData: Produce[] = []
  produceData: Produce[] = []
  imageUrl: string = '';

  constructor(
    private pixabayService: PixabayService,
    private router: Router,
    private http: HttpClient,
    private historyOfferService: HistoryOfferService, 
    // private cdr: ChangeDetectorRef,
    private store: StoreService // Inject StoreService
  ) {}

  ngOnInit(): void {
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
      this.products = products;
      this.products.forEach((product) => {
        const productLabel = product?.ontoFoodType?.label;
        if (productLabel) {
          const capitalized = this.capitalizeFirstLetter(productLabel);
          const exists = this.produceData.some(item => item.name === capitalized);
          if (!exists)
            this.produceData.push({name: capitalized,
                                  dateStart: product?.product?.dateStart,
                                  dateEnd: product?.product?.dateEnd,
                                  isPermanent: product?.product?.isPermanent});
        }
      })
    });

    this.historyOfferService.loaded$.subscribe(loaded => {
      this.loaded = loaded;
      if (loaded)
        this.updateOutputList();
    });
  }

  updateOutputList() {
    this.filterProductsBySeason(this.selectedSeason.name);
    this.loadImagesForProduce();
    console.log('items ', this.outputData.length);
  }

  filterProductsBySeason(season: string): void {
    const now = new Date();
    this.outputData = this.produceData.filter(product => {
      if (product.isPermanent) {
        return true; // Always available
      }

      const dateStart = this.parseDate(product.dateStart);
      const dateEnd = this.parseDate(product.dateEnd);

      if (!dateStart || !dateEnd) {
        return false; // Skip products with invalid or null dates
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
  }

  loadImagesForProduce() {
    this.produceData.forEach((produce) => {
      this.pixabayService.searchImage(produce.name).subscribe({
        next: (response: any) => {
          if (response.hits && response.hits.length > 0) {
            produce.imageUrl = response.hits[0].webformatURL;  // Set the first image URL
          } else {
            produce.imageUrl = '';  // No image found
            console.warn(`Kein Bild gefunden für ${produce.name}`);
          }
          },
          error: (error) => {
            console.error(`Fehler beim Abrufen des Bildes für ${produce.name}:`, error);
            produce.imageUrl = '';  // In case of an error, fallback to no image
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

  showDetails(product: HistoricProductType): void {
    this.selectedProduct = product;
    this.displayDialog = true;
    // this.cdr.detectChanges(); // Manually trigger change detection
  }

  logToConsole(message: string): void {
    console.log(message);
  }

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
}
