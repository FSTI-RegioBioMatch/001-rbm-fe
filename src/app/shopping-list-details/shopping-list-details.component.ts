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
import { NewOfferService } from '../shared/services/new-offer.service';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

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
    SliderModule,
    FormsModule,
    ToastModule,
  ],
  standalone: true,
  providers: [MessageService]
})
export class ShoppingListDetailsComponent implements OnInit {
  shoppingList: any;
  ingredientNames: string[] = [];
  offers: any[] = [];
  loading = true;
  range: number = 50;
  localizationData: { displayLabel: string; value: string }[] = [];
  constructor(
    private route: ActivatedRoute,
    private shoppingListService: NewShoppingListService,
    private offerService: NewOfferService,
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
            this.messageService.add({severity: 'error', summary: 'Fehler',
              detail: 'Es wurde keine Einkaufslisten-ID angegeben'
            })
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
          }
        },
        error: error => {
          console.error('Error fetching shopping list:', error);
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Einkaufsliste'})
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
    const address = this.offerService.getAddress();
  
    if (address) {
      this.fetchOffers(address);
    } else {
      this.store.selectedCompanyContext$
        .pipe(
          filter(company => company !== null),
          switchMap((company) => {
            if (company && company.addresses && company.addresses.length > 0) {
              const addressUrl = company.addresses[0].self;
              return this.offerService.getAddressFromUrl(addressUrl);
            } else {
              return of(null);
            }
          }),
          take(1)
        )
        .subscribe({
          next: (address: AddressType | null) => {
            if (address) {
              this.offerService.setAddress(address);
              this.fetchOffers(address);
            } else {
              this.messageService.add({severity: 'error', summary: 'Fehler',
                detail: 'Adresse nicht verfügbar'
              })
              this.loading = false;
            }
          },
          error: err => {
            this.messageService.add({severity: 'error', summary: 'Fehler',
              detail: 'Adresse konnte nicht geladen werden'
            });
            console.error('Error loading address:', err);
            this.loading = false;
          }
        });
    }
  }
  
  
  private fetchOffers(address: AddressType): void {
    this.offerService.setOffersBySearchRadius(this.range, address)
      .pipe(take(1))  // Ensure only one subscription and wait for offers to be set
      .subscribe({
        next: offers => {
          if (offers.length > 0) {
            //this.messageService.add({severity: 'info', summary: 'Laden', detail: 'Angebote wurden geladen'});
            console.log('Offers loaded:', offers);
            this.offers = offers;  // Store the offers
          } else {
            //this.messageService.add({severity: 'info', summary: 'Keine Angebote', detail: 'Es konnten keine Angebote gefunden werden'});
            console.log('No offers found');
          }
          this.loading = false;  // Stop loading once offers are fetched
        },
        error: error => {
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Angebote'})
          console.error('Error loading offers:', error);
          this.loading = false;  // Stop loading on error
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
  clearCacheAndReload(): void {
    this.loading = true
    this.offerService.clearOfferCache(); // Clear the cache
    this.loadOffers(); // Reload the offers
  }
}