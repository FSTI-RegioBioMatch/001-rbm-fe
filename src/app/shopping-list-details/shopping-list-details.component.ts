import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { filter, switchMap, take } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { NewShoppingListService } from '../shared/services/new-shopping-list.service';
import { OfferService } from '../shared/services/offer.service';
import { StoreService } from '../shared/store/store.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';
import { AddressType } from '../shared/types/address.type';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { of } from 'rxjs';

interface IngredientUnit {
  label: string;
  value: string;
}

// Define the units array
const ingredientUnits: IngredientUnit[] = [
  { label: 'Gramm', value: 'g' },
  { label: 'Kilogramm', value: 'kg' },
  { label: 'Liter', value: 'l' },
  { label: 'Milliliter', value: 'ml' },
  { label: 'Stück', value: 'pcs' },
  { label: 'Teelöffel', value: 'tsp' },
  { label: 'Esslöffel', value: 'tbsp' },
  { label: 'Tassen', value: 'cup' },
  { label: 'Pfund', value: 'lb' },
  { label: 'Unzen', value: 'oz' },
  { label: 'Pakete', value: 'pkg' },
  { label: 'Scheiben', value: 'slices' },
  { label: 'Prisen', value: 'pinch' },
  { label: 'Dosen', value: 'cans' },
  { label: 'Flaschen', value: 'bottles' },
  { label: 'Gläser', value: 'jars' },
  { label: 'Zentiliter', value: 'cl' },
  { label: 'Milligramm', value: 'mg' },
  { label: 'Dekagramm', value: 'dag' },
  { label: 'Gallonen', value: 'gallon' },
  { label: 'Pints', value: 'pint' },
  { label: 'Quarts', value: 'quart' },
  { label: 'Stangen', value: 'sticks' },
  { label: 'Blätter', value: 'leaves' },
  { label: 'Becher', value: 'beaker' },
  { label: 'Kellen', value: 'ladle' },
  { label: 'Zweige', value: 'sprigs' },
  { label: 'Köpfe', value: 'heads' },
  { label: 'Zehen', value: 'cloves' },
  { label: 'Schalen', value: 'peels' },
  { label: 'Hände', value: 'hands' },
  { label: 'Bündel', value: 'bunches' },
  { label: 'Blöcke', value: 'blocks' },
  { label: 'Körner', value: 'grains' },
];
@Component({
  selector: 'app-shopping-list-details',
  templateUrl: './shopping-list-details.component.html',
  styleUrls: ['./shopping-list-details.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    AccordionModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    PanelModule,
    CardModule,
  ],
  standalone: true,
  providers: [MessageService]
})
export class ShoppingListDetailsComponent implements OnInit {
  shoppingList: any;
  ingredientNames: string[] = [];
  offers: any[] = [];
  loading = true;
  errorMessage = '';
  localizationData: { displayLabel: string; value: string }[] = [];
  constructor(
    private route: ActivatedRoute,
    private shoppingListService: NewShoppingListService,
    private offerService: OfferService,
    private router: Router,
    private store: StoreService,
    private messageService: MessageService,
    private nearbuyTestService: NearbuyTestService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Subscribe to the company context and route parameters
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(() => this.route.paramMap),
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            return this.shoppingListService.getShoppingListById(id);
          } else {
            this.errorMessage = 'Es wurde keine Einkaufslisten-ID angegeben';
            this.loading = false;
            return [];
          }
        })
      )
      .subscribe({
        next: list => {
          if (list) {
            this.shoppingList = list;
            this.ingredientNames = Object.keys(this.shoppingList.groupedShoppingList);
            this.loadOffers(); // Now load offers after the shopping list is fetched
            this.loading = false;
          }
        },
        error: error => {
          console.error('Error fetching shopping list:', error);
          this.errorMessage = 'Einkaufsliste konnte nicht gefunden werden';
          this.loading = false;
        }
      });

    // Load localization data
    this.nearbuyTestService.getData().subscribe({
      next: result => {
        this.localizationData = result; // Save localization data for later use
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
      }
    });
  }

  private loadOffers(): void {
    // Check if the address is already set
    const address = this.offerService.address;
    
    if (address) {
      // Address is already set, fetch offers
      this.fetchOffers(address);
    } else {
      // Address is not set, fetch it asynchronously
      this.store.selectedCompanyContext$
        .pipe(
          filter(company => company !== null),  // Ensure company context is not null
          switchMap((company) => {
            // Fetch the address based on the company context
            if (company && company.addresses && company.addresses.length > 0) {
              const addressUrl = company.addresses[0].self;
              return this.offerService.getAddress(addressUrl); // Fetch address from the URL
            } else {
              return of(null); // Return null if no address is available
            }
          }),
          take(1) // Only take the first valid address emission
        )
        .subscribe({
          next: (address: AddressType | null) => {
            if (address) {
              // Set the address in the OfferService
              this.offerService.setAddress(address);
              // Fetch the offers once the address is available
              this.fetchOffers(address);
            } else {
              // Handle the case where no address is available
              this.errorMessage = 'Address not available';
              this.loading = false;
            }
          },
          error: err => {
            this.errorMessage = 'Error loading address';
            console.error('Error loading address:', err);
            this.loading = false;
          }
        });
    }
  }
  
  private fetchOffers(address: AddressType): void {
    this.offerService.setOffersBySearchRadius(250, address); // Set initial search radius and address
  
    this.offerService.offers$
      .pipe(take(1)) // Ensure only one subscription
      .subscribe({
        next: offers => {
          console.log('Offers loaded:', offers);
          this.offers = offers; // Store the offers
          this.loading = false; // Stop loading once offers are fetched
        },
        error: error => {
          console.error('Error loading offers:', error);
          this.errorMessage = 'Error loading offers';
          this.loading = false; // Stop loading on error
        }
      });
  }

  onClickGoToOffer() {
    const scanId = uuidv4();
    this.router.navigate([`/menu-planning/shopping-list/${this.shoppingList.id}/offer-scan/${scanId}`]);
  }

  getLocalizedLabel(ingredientName: string): string {
    const localizedItem = this.localizationData.find(item => item.value === ingredientName);
    return localizedItem ? localizedItem.displayLabel : ingredientName;
  }

  getUnitLabel(unitValue: string): string {
    const unit = ingredientUnits.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue; // Return the label if found, else return the value itself
  }
  matchOfferToIngredient(ingredientName: string, offer: any): boolean {
    return ingredientName.toLowerCase() === offer?.ontoFoodType?.label?.toLowerCase();
  }
  getProcessingBreakdown(processingBreakdown: { [key: string]: number }): { label: string, amount: number }[] {
    return Object.keys(processingBreakdown || {}).map(key => ({
        label: key,
        amount: processingBreakdown[key]
    }));
}
}