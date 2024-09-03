import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { filter, switchMap } from 'rxjs/operators';
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
    MessageModule
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
    private storeService: StoreService,
    private router: Router,
    private store: StoreService,
    private messageService: MessageService,
    private nearbuyTestService: NearbuyTestService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.store.selectedCompanyContext$
    .pipe(
      filter(company => company !== null)
    )
    .subscribe({
      next: (data) => {
        this.route.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.loadShoppingList(id);
          } else {
            this.errorMessage = 'No shopping list ID provided';
            this.loading = false;
          }
        });
        this.nearbuyTestService.getData().subscribe({
          next: (result) => {
            this.localizationData = result; // Save localization data for later use
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fehler beim laden der Übersetzungen' });
          }
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fehler beim laden der Menüplanung' });
        console.error('Error loading menu plans', error);
      }
    });
  }

  private loadShoppingList(id: string): void {
    this.storeService.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company => this.shoppingListService.getShoppingListById(id))
      )
      .subscribe({
        next: list => {
          this.shoppingList = list;
          this.ingredientNames = Object.keys(this.shoppingList.groupedShoppingList);
          this.loadOffers();
          this.loading = false;
        },
        error: error => {
          console.error('Shopping list not found:', error);
          this.errorMessage = 'Shopping list not found';
          this.loading = false;
        }
      });
  }

  private loadOffers(): void {
    if (this.shoppingList && this.shoppingList.groupedShoppingList) {
      const ingredientNames = this.ingredientNames;

      this.offerService.setOffersBySearchRadius(50, this.offerService.address); // Setting initial search radius and address
      
      this.offerService.offers$.subscribe({
        next: offers => {
          this.offers = offers.filter(offer =>
            offer.ontoFoodType?.label && ingredientNames.includes(offer.ontoFoodType.label)
          );
        },
        error: error => {
          console.error('Error loading offers:', error);
          this.errorMessage = 'Error loading offers';
        }
      });
    }
  }

  getOfferForIngredient(ingredientName: string): any[] {
    return this.offers.filter(offer => offer.ontoFoodType?.label === ingredientName);
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
}
