import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { filter, switchMap, take } from 'rxjs/operators';
import { NewShoppingListService } from '../shared/services/new-shopping-list.service';
import { StoreService } from '../shared/store/store.service';
import { Accordion, AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';
import { AddressType } from '../shared/types/address.type';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { of } from 'rxjs';
import { NewOfferService } from '../shared/services/new-offer.service';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import  { CheckboxModule } from 'primeng/checkbox';
import { OfferToOrderService } from '../shared/services/offer-to-order.service';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MeterGroupModule } from 'primeng/metergroup';
import { TabViewModule } from 'primeng/tabview';
import { LocalizeService } from '../shared/services/localize.service';

export interface IngredientUnit {
  label: string;
  value: string;
}
interface Ingredient {
  unit: string;
  totalAmount: number;
  processingBreakdown: { [label: string]: number };
}

interface TotalAmountsPerUnit {
  [unit: string]: number;
}

interface ProcessingBreakdownPerUnit {
  [unit: string]: number;
}

interface CombinedProcessingBreakdown {
  [label: string]: ProcessingBreakdownPerUnit;
}

interface MeterItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  size: number;
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
    DialogModule,
    ConfirmDialogModule,
    CheckboxModule,
    StepperModule,
    ToggleButtonModule,
    MeterGroupModule,
    TabViewModule
  ],
  standalone: true,
  providers: [MessageService, ConfirmationService]
})
export class ShoppingListDetailsComponent implements OnInit {
  @ViewChild('accordion') accordion!: Accordion;
  shoppingList: any;
  ingredientNames: string[] = [];
  offers: any[] = [];
  ingredientOfferMapping: { ingredient: any; offers: { offer: any, selected: boolean }[], status: string, selected: boolean }[] = [];
  shoppingListSummary: { ingredient: any; offers: { offer: any, selected: boolean }[], status: string, selected: boolean }[] = [];
  loading = true;
  range: number = 50;
  localizationData: { displayLabel: string; value: string }[] = [];
  localizationDataUnits: { [key: string]: string } = {};
  localizationDataLOP: { [key: string]: string } = {};
  hasOrdersRunning: boolean = false;
  active: number | undefined = 0;

  offerDataList: any[] = [];

  showRunningOrdersDialog: boolean = false;
  showOfferSelectionDialog: boolean = false;
  selectedIngredientName: string = '';
  selectedIngredientOffers: { offer: any; selected: boolean }[] = [];
  constructor(
    private route: ActivatedRoute,
    private shoppingListService: NewShoppingListService,
    private offerService: NewOfferService,
    private router: Router,
    private store: StoreService,
    private messageService: MessageService,
    private nearbuyTestService: NearbuyTestService,
    private offerToOrderService: OfferToOrderService,
    private localizeService: LocalizeService
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
            this.checkIfShoppinglistHasOngoing()

            console.log("shoppinglist", this.shoppingList)
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
    this.localizeService.getLevelsOfProcessing().subscribe({
      next: result => {
        this.localizationDataLOP = result; // Save localization data for later use
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
      }
    });
    this.localizeService.getUnits().subscribe({
      next: result => {
        this.localizationDataUnits = result; // Save localization data for later use
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
      }
    });

  }

  checkIfShoppinglistHasOngoing() {
    if (!this.shoppingList || !this.shoppingList.id) {
      console.error('Shopping list or shopping list ID is undefined.');
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Einkaufslisten-ID ist nicht verfügbar.',
      });
      return;
    }
  
    this.offerToOrderService.getByShoppinglistId(this.shoppingList.id).subscribe({
      next: (result) => {
        console.log('result', result);
        if (result.length > 0) {
          const shoppingListId = this.shoppingList?.id ?? 'default-id';
          
          // Display a warning message
          this.messageService.add({
            severity: 'warn',
            summary: 'Warnung',
            detail:
              'Zu dieser Einkaufsliste wurden laufende Vorgänge gefunden.',
          });
  
          // Fetch the mapped offers
          this.offerToOrderService
            .getMappedOffersFromShoppinglistId(shoppingListId)
            .subscribe({
              next: (data) => {
                if (Array.isArray(data) && data.length > 0) {
                  // Store the data and show the selection dialog
                  this.offerDataList = data;
                  this.showRunningOrdersDialog = true;
                } else {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Fehler',
                    detail: 'Keine Angebotsdaten gefunden.',
                  });
                }
              },
              error: (err) => {
                console.error('Error fetching mapped offers:', err);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Fehler',
                  detail: 'Fehler beim Laden der Angebotsdaten.',
                });
              },
            });
  
          this.hasOrdersRunning = true;
        } else {
          this.hasOrdersRunning = false;
        }
      },
      error: (err) => {
        console.error('Error fetching shopping list:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Fehler beim Laden der Einkaufsliste',
        });
        this.loading = false;
      },
    });
  }
  
  // Method to navigate to the selected offer
  navigateToOffer(offerId: string) {
    this.router.navigate(['/shoppinglist-to-order-details', offerId]);
    this.showRunningOrdersDialog = false;
  }
  
  navigateToOrder(orderId: string) {
    this.router.navigate(['/shoppinglist-to-order-details', orderId]);
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
            this.matchIngredientsToOffers();
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
  
  getLocalizedLabel(ingredientName: string): string {
    const localizedItem = this.localizationData.find(item => item.value === ingredientName);
    return localizedItem ? localizedItem.displayLabel : ingredientName;
  }

  getLocalizedLabelLOP(levelsOfProcessing: string): string {
    if (!levelsOfProcessing || !this.localizationDataLOP) {
      return ''; // Return empty string if no translation is available or input is empty
    }
  
    // Split by commas and trim each label
    const labels = levelsOfProcessing.split(',').map(label => label.trim());
  
    // Translate each label individually, falling back to the original label if no translation is found
    const translatedLabels = labels
      .map(label => this.localizationDataLOP[label] || label)
      .filter(label => label.toLowerCase() !== 'n/a' && label !== ''); // Filter out 'n/a' and empty labels
  
    // Join the translated labels back with a comma separator
    return translatedLabels.length > 0 ? translatedLabels.join(', ') : ''; // Return empty string if no valid labels
  }


  getLocalizedLabelUnit(unit: string): string {
    if (!unit || !this.localizationDataUnits) {
      return unit; // Return original value if no translation is available or input is empty
    }
  
    // Split by commas and trim each label
    const labels = unit.split(',').map(label => label.trim());
  
    // Translate each label individually, falling back to the original label if no translation is found
    const translatedLabels = labels.map(label => this.localizationDataUnits[label] || label);
  
    // Join the translated labels back with a comma separator
    return translatedLabels.join(', ');
  }


  getUnitLabel(unitValue: string): string {
    const unit = ingredientUnits.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue; // Return the label if found, else return the value itself
  }
  matchOfferToIngredient(ingredientName: string, offer: any): boolean {
    return ingredientName.toLowerCase() === offer?.ontoFoodType?.label?.toLowerCase();
  }
  getProcessingBreakdown(combinedProcessingBreakdown: CombinedProcessingBreakdown): { label: string, unit: string, amount: number }[] {
    const breakdownArray: { label: string, unit: string, amount: number }[] = [];
  
    for (const [label, unitAmounts] of Object.entries(combinedProcessingBreakdown)) {
      for (const [unit, amount] of Object.entries(unitAmounts)) {
        breakdownArray.push({
          label,
          unit,
          amount
        });
      }
    }
  
    return breakdownArray;
  }
  clearCacheAndReload(): void {
    this.loading = true
    this.loadOffers(); // Reload the offers
    
  }

  private matchIngredientsToOffers(): void {
    this.ingredientOfferMapping = this.ingredientNames.map(ingredientName => {
      const ingredient = this.shoppingList.groupedShoppingList[ingredientName];
      const matchedOffers = this.offers
        .filter(offer => this.matchOfferToIngredient(ingredientName, offer))
        .map(offer => ({
          offer,
          selected: false
        }));
  
      const status = matchedOffers.length > 0 ? 'OFFERS_FOUND' : 'NO_OFFERS';
      const selected = matchedOffers.some(offerItem => offerItem.selected);
  
      return { ingredient, offers: matchedOffers, status, selected };
    });
    console.log("gemappte liste: ", this.ingredientOfferMapping)
  }


  toggleOfferSelection(ingredientName: string, offerId: string, isChecked: boolean): void {
    const ingredientMapping = this.ingredientOfferMapping.find(item => item.ingredient === ingredientName);
    if (ingredientMapping) {
      // Wenn das Angebot ausgewählt wird, alle anderen Angebote abwählen
      if (isChecked) {
        ingredientMapping.offers.forEach(o => o.selected = o.offer.offerDetails.id === offerId);
      } else {
        // Wenn das Angebot abgewählt wird, nur dieses Angebot abwählen
        const offer = ingredientMapping.offers.find(o => o.offer.offerDetails.id === offerId);
        if (offer) {
          offer.selected = false;
        }
      }
      // Aktualisieren Sie den ausgewählten Zustand der Zutat
      ingredientMapping.selected = ingredientMapping.offers.some(o => o.selected);
    }
  }

  // For testing

  createSummary(): void {
    this.shoppingListSummary = this.ingredientOfferMapping.map(mapping => {
        return {
            ...mapping,
            offers: mapping.offers.filter(offer => offer.selected)
          };
        });
        const shoppingListToOrder = {
          mappedOffersIngredients: this.shoppingListSummary,
          shoppingListId: this.shoppingList.id
        };
        console.log(JSON.stringify(shoppingListToOrder, null, 2));
        this.offerToOrderService.createMappedOffersIngredients(shoppingListToOrder).subscribe({
          next: response => {
            console.log('Response:', response);
            this.messageService.add({severity: 'success', summary: 'Erfolgreich',
              detail: 'Die Einkaufsliste wurde erfolgreich verarbeitet'
            });
            setTimeout(() => {
              this.router.navigate(['/shoppinglist-to-order-details', response.id]);
            }, 1200); // Delay of 1.2 seconds to allow the toast to be visible
          },
          error: err => {
            console.error('Error processing shopping list:', err);
            this.messageService.add({severity: 'error', summary: 'Fehler',
              detail: 'Fehler beim Verarbeiten der Einkaufsliste'
            });
          }
        })
  }
  openshowOfferSelectionDialog()
  {
    this.showRunningOrdersDialog = true;
  }
  getButtonLabel(): string {
    const hasOffersFound = this.ingredientOfferMapping.some(
      (item) => item.status === 'OFFERS_FOUND'
    );
  
    const hasSelectedItems = this.ingredientOfferMapping.some(
      (item) => item.status === 'OFFERS_FOUND' && item.selected
    );
  
    const allNoOffers = this.ingredientOfferMapping.every(
      (item) => item.status === 'NO_OFFERS'
    );
  
    if (hasOffersFound && hasSelectedItems) {
      return 'Bestellen';
    } else if (hasOffersFound && !hasSelectedItems) {
      return 'Ohne Angebote weiter';
    } else if (allNoOffers) {
      return 'Keine Angebote gefunden. Trotzdem bestellen?';
    }
  
    return 'Bestellen'; // Fallback-Text
  }
  getTotalAmountsPerUnit(ingredientName: string): TotalAmountsPerUnit {
    const ingredients = this.shoppingList?.groupedShoppingList[ingredientName] as Ingredient[];
    if (!ingredients) return {};
  
    const totalAmountsPerUnit: TotalAmountsPerUnit = {};
    ingredients.forEach((ingredient: Ingredient) => {
      const unit = ingredient.unit;
      if (!totalAmountsPerUnit[unit]) {
        totalAmountsPerUnit[unit] = 0;
      }
      totalAmountsPerUnit[unit] += ingredient.totalAmount;
    });
  
    return totalAmountsPerUnit; // e.g., { 'kg': 234, 'pcs': 300 }
  }
  
  // Method to get total amounts per unit as an array for easier iteration in the template
  getTotalAmountsPerUnitArray(ingredientName: string): { unit: string; totalAmount: number }[] {
    const totalAmountsPerUnit = this.getTotalAmountsPerUnit(ingredientName);
    return Object.keys(totalAmountsPerUnit).map(unit => {
      return { unit, totalAmount: totalAmountsPerUnit[unit] };
    });
  }
  
  // Method to get combined processing breakdowns for an ingredient
  getCombinedProcessingBreakdown(ingredientName: string): CombinedProcessingBreakdown {
    const ingredients = this.shoppingList?.groupedShoppingList[ingredientName] as Ingredient[];
    if (!ingredients) return {};
  
    const combinedProcessingBreakdown: CombinedProcessingBreakdown = {};
  
    ingredients.forEach((ingredient: Ingredient) => {
      const processingBreakdown = ingredient.processingBreakdown;
      const unit = ingredient.unit;
  
      for (const [label, amount] of Object.entries(processingBreakdown)) {
        if (!combinedProcessingBreakdown[label]) {
          combinedProcessingBreakdown[label] = {};
        }
        if (!combinedProcessingBreakdown[label][unit]) {
          combinedProcessingBreakdown[label][unit] = 0;
        }
        combinedProcessingBreakdown[label][unit] += amount;
      }
    });
  
    return combinedProcessingBreakdown; // e.g., { 'CUT,PEELED': { 'kg': 150, 'l': 100 }, 'n/a': { 'kg': 84 } }
  }

  hasOffersForIngredient(ingredientName: string): boolean {
    const mapping = this.ingredientOfferMapping.find(mapping =>
      mapping.ingredient.some((ing: any) => ing.name === ingredientName)
    );
    return (mapping?.offers?.length ?? 0) > 0;
  }

  openOfferSelectionDialog(ingredientName: string): void {

    this.selectedIngredientName = ingredientName;
  
    // Adjust the find method to compare the ingredient names correctly
    const ingredientMapping = this.ingredientOfferMapping.find(mapping =>
      mapping.ingredient.some((ing: any) => ing.name === ingredientName)
    );
  
    if (ingredientMapping) {
      this.selectedIngredientOffers = ingredientMapping.offers;
      this.showOfferSelectionDialog = true;
    } else {
      // Handle case where no mapping is found
      this.selectedIngredientOffers = [];
      this.showOfferSelectionDialog = true;
    }
  }
  closeOfferSelectionDialog(): void {
    this.showOfferSelectionDialog = false;
  }
  onOfferSelectionChange(): void {
    const ingredientMapping = this.ingredientOfferMapping.find(mapping =>
      mapping.ingredient.some((ing: any) => ing.name === this.selectedIngredientName)
    );
  
    if (ingredientMapping) {
      ingredientMapping.selected = ingredientMapping.offers.some(o => o.selected);
    }
  }
  getProcessingBreakdownLabelsForIngredient(ingredientName: string): string[] {
    const combinedProcessingBreakdown = this.getCombinedProcessingBreakdown(ingredientName);
    const processingBreakdownItems = this.getProcessingBreakdown(combinedProcessingBreakdown);
    let labels: string[] = [];
  
    processingBreakdownItems.forEach(item => {
      // Split labels by comma and trim spaces
      const splitLabels = item.label.split(',').map(label => label.trim());
      labels = labels.concat(splitLabels);
    });
  
    // Filter out 'n/a' and empty strings, remove duplicates
    const filteredLabels = labels
      .filter(label => label.toLowerCase() !== 'n/a' && label !== '')
      .map(label => label.toUpperCase().trim());
  
    return Array.from(new Set(filteredLabels));
  }
  getProcessingMatchType(offerItem: any): 'exact' | 'partial' | 'none' {
    // Access levelsOfProcessing from offerDetails or fullDetails
    const levelsOfProcessing = offerItem.offer?.offerDetails?.levelsOfProcessing ||
                               offerItem.offer?.offerDetails?.fullDetails?.levelsOfProcessing;
  
    // Get the processing breakdown labels for the selected ingredient
    const processingBreakdownLabels = this.getProcessingBreakdownLabelsForIngredient(this.selectedIngredientName);
  
    // Normalize the labels for comparison
    const normalizedIngredientLabels = processingBreakdownLabels.map(label => label.trim().toUpperCase());
    const offerProcessingLabels = levelsOfProcessing?.map((lp: any) => lp.label.trim().toUpperCase()) || [];
  
    const ingredientRequiresProcessing = normalizedIngredientLabels.length > 0;
    const offerHasProcessing = offerProcessingLabels.length > 0;
  
    if (!ingredientRequiresProcessing) {
      // Ingredient does not require any processing
      if (!offerHasProcessing) {
        // Offer is also unprocessed
        return 'exact';
      } else {
        // Offer is processed but ingredient doesn't require processing
        return 'none';
      }
    } else {
      // Ingredient requires specific processing
      if (!offerHasProcessing) {
        // Ingredient requires processing but offer is unprocessed
        return 'none';
      } else {
        // Both have processing levels, proceed with matching logic
        const processingBreakdownSet = new Set(normalizedIngredientLabels);
        const offerProcessingSet = new Set(offerProcessingLabels);
  
        const isExactMatch = processingBreakdownSet.size === offerProcessingSet.size &&
                             [...processingBreakdownSet].every(label => offerProcessingSet.has(label));
  
        if (isExactMatch) {
          return 'exact';
        }
  
        const hasPartialMatch = [...processingBreakdownSet].some(label => offerProcessingSet.has(label));
  
        if (hasPartialMatch) {
          return 'partial';
        }
  
        return 'none';
      }
    }
  }

  
  onAccordionTabChange(event: any, index: number): void {
    const selectedTab = this.accordion.tabs[index];
    this.selectedIngredientName = selectedTab.header ?? '';
  }

  getTotalIngredientsCount(): number {
    return this.ingredientOfferMapping.reduce((total, item) => {
      if (item.ingredient[0]?.name === this.ingredientNames[0]) {
        return total + item.ingredient.length;
      }
      return total;
    }, 0);
  }
  
  getOffersFoundSelectedCount(): number {
    return this.ingredientOfferMapping.filter(item => item.status === 'OFFERS_FOUND' && item.selected).length;
  }
  
  getOffersFoundUnselectedCount(): number {
    return this.ingredientOfferMapping.filter(item => item.status === 'OFFERS_FOUND' && !item.selected).length;
  }
  
  getNoOffersCount(): number {
    return this.ingredientOfferMapping.filter(item => item.status === 'NO_OFFERS').length;
  }
  
  getMeterItems(): MeterItem[] {
    const total = this.getTotalIngredientsCount();
    const items = [
      { label: 'Ausgewählt', value: this.getOffersFoundSelectedCount(), icon: 'pi pi-check', color: 'green', size: (this.getOffersFoundSelectedCount() / total) * 100 },
      { label: 'Verfügbar', value: this.getOffersFoundUnselectedCount(), icon: 'pi pi-pencil', color: 'orange', size: (this.getOffersFoundUnselectedCount() / total) * 100 },
      { label: 'Unverfügbar', value: this.getNoOffersCount(), icon: 'pi pi-ban',  color: 'red', size: (this.getNoOffersCount() / total) * 100 }
    ];
    return items;
  }

  hasNoUnselectedOffers(): boolean {
    return this.ingredientOfferMapping.every(item => item.status !== 'OFFERS_FOUND' || item.selected);
  }
}