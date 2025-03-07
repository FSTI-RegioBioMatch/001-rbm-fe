import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewMenuplanService } from '../../shared/services/new-menuplan.service';
import { RecipeService } from '../../shared/services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, switchMap, forkJoin, of, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { StoreService } from '../../shared/store/store.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import convert, { Unit } from 'convert-units';
import { NewShoppingListService } from '../../shared/services/new-shopping-list.service';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { NearbuyTestService } from '../../shared/services/nearbuy-test.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { OfferService } from '../../shared/services/offer.service';
import { CardModule } from 'primeng/card';
import { LocalizeService } from '../../shared/services/localize.service';
import { TourService } from '../../shared/services/tour.service';

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
interface IngredientAlternative {
  name: string;
  amount: string | number;
  unit: string;
  processing?: string;
}
interface Ingredient {
  name: string;
  unit: string;
  amount: string | number;
  processing?: string;  // Processing method like 'ganz', 'geschnitten', etc.
  combinedAmount?: string;  // For storing combined amounts with processing details
  alternatives?: IngredientAlternative[];
  optional?: boolean;    // Add this property
}

interface Recipe {
  id: string;
  recipeName: string;
  ingredients: Ingredient[];
}

interface EnhancedIngredient {
  name: string;
  unit: string;
  totalAmount: number;
  sourceRecipes: string[];
  category: 'mass' | 'volume' | 'others';
  convertible: boolean;
  processingBreakdown: { [processing: string]: number };
  totalInLargestUnit?: string;
  errorMessages?: { [processing: string]: string };
  isAlternative?: boolean; // Add this property
  optional?: boolean;    // Add this property
}



@Component({
  selector: 'app-my-menus',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    TooltipModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    MultiSelectModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './my-menus.component.html',
  styleUrl: './my-menus.component.scss'
})
export class MyMenusComponent implements OnInit {
  localizationDataLOP: { [key: string]: string } = {};
  menuPlans: any[] = [];
  expandedMenuPlanId: string | null = null;
  recipesWithIngredients: { [key: string]: Recipe[] } = {};
  selectedMenuPlans: any[] = [];
  groupedShoppingList: { [name: string]: EnhancedIngredient[] } = {}; // Grouped by ingredient name
  localizationData: { displayLabel: string; value: string }[] = [];
  loading = false;
  loadingRecipes = false;
  loadingLocalize = false;
  loadingProcessingOptions = false;
  loadingLocalizedProcessing = false;
  displayShoppingListDialog: boolean = false;
  hoveredMenuPlanId: string | null = null;
  processingOptions: { label: string, value: string }[] = [];
  expandedConfigurationModal: boolean = false;
  selectedMenuPlanId: string | null = null;

  constructor(
    private menuPlanService: NewMenuplanService,
    private recipeService: RecipeService,
    private store: StoreService,
    private shoppingListService: NewShoppingListService,
    private messageService: MessageService,
    private router: Router,
    private nearbuyTestService: NearbuyTestService,
    private offerService: OfferService,
    private localizeService: LocalizeService,
    private tourService: TourService
  ) {}

  repeatOptions = [
    { label: 'Täglich', value: 'DAILY' },
    { label: 'Wöchentlich', value: 'WEEKLY' },
    { label: 'Monatlich', value: 'MONTHLY' },
    { label: 'Jährlich', value: 'YEARLY' },
    { label: 'Einmalig', value: 'ONCE' },
  ];

  ngOnInit(): void {
    this.loading = true; // Set to true when loading menu plans
    this.loadProcessingOptions(); // Load the processing options from the API
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company => this.menuPlanService.getAllMenuPlans())
      )
      .subscribe({
        next: (data) => {
          this.menuPlans = data;
          this.loadLocalizationData(); // Load localization data separately
          this.menuPlans.forEach(menuPlan => {
            this.loadRecipesWithIngredients(menuPlan.id);
          });
          this.loading = false; // Set to false after loading menu plans
        },
        error: (error) => {
          this.loading = false; // Set to false in case of an error
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim laden der Menüplanung' });
          console.error('Error loading menu plans', error);
        }
      });

    const steps = [
      { element: '.pt-mymenus1', title: "Menüplan Erstellen", text: 'Die Meine Menüs Seite hat 4 Reiter. Bei der Menüplanung kannst du neue Menüs erstellen, die du später auch als Einkaufsliste verwandeln kannst' },
      { element: '.pt-mymenus2', title: "Aktueller Reiter", text: 'Hier befinden wir uns gerade. Hier findest du alle deine Menüs und kannst die Details begutachten oder die Zutaten Einkaufen gehen' },
      { element: '.pt-mymenus3', title: "Einkaufszettel", text: 'Alle deine bisherigen Einkaufszettel sind hier zu finden' },
      { element: '.pt-mymenus4', title: "Angebote in der Region", text: 'Bei der Angebotsliste findest du die Angebote in deienr Region' },
      { element: '.pt-mymenus-checkbox', title: "Dein Menü", text: 'Setze bei einem oder mehreren Menüs dein Häckchen um es als Auswahl für den Einkauszettel hinzuzufügen' },
      { element: '.pt-mymenus-einkauf-btn', title: "Einkaufszettel erstellen", text: 'Sobald du 1 oder mehrere ausgewählt hast kannst du daraus einen Einkaufszettel mit dem Knopf erstellen' },
      { element: '.pt-mymenus-portions', title: "Portionen gesamt", text: 'Hier siehst du neben wichtige infos auch die Portion Menge. gehe mit dem Mauszeiger über die Zahl um zu sehen wie viel vegetarische, ve...Portionen du hast' },
      { element: '.pt-mymenus-komponente', title: "Komponenten | Veredlungen", text: 'Möchtest du Zutaten gleich geschält oder sonstige Veredlungen? Dann kannst du das hier festlegen für deinen EInkaufszettel. Es sucht dann später automatisch nach einem passenden Angebot' },
      { element: '.pt-mymenus-details', title: "Details anzeigen", text: 'Betrachte dein ganzes Menü. In der Detail Ansicht kannst du es auch löschen.' },
    ];

    this.tourService.setSteps(steps);
  }

  ngOnDestroy(): void {
    this.tourService.setSteps([]);
  }


  // Method to load processing options from the API
  loadProcessingOptions(): void {
    this.loadingProcessingOptions = true; // Set to true when loading processing options
    this.offerService.getLevelsOfProcessing().subscribe({
      next: (data) => {
        // Transform the response into the expected format for the dropdown
        this.processingOptions = data.map((item: any) => ({
          label: item.label,   // The label for the dropdown
          value: item.label    // Use label or item.id if you want to use a unique ID as value
        }));
        this.loadingProcessingOptions = false; // Set to false after successful loading

        this.loadingLocalizedProcessing = true;
        this.offerService.getLocalizedLoP().subscribe({
          next: (data) => {
            this.processingOptions = this.processingOptions.map((item: any) => {
              const localizedLabel = data[item.label]; 
               // Match the label with the localized data using the key
              return {
                label: localizedLabel ? localizedLabel : item.label,  // Use localized label if available, otherwise fallback to original label
                value: item.label  // Keep the original value or use item.id if needed
              };
            });
            this.loadingLocalizedProcessing = false;
          },
          error: (err) => {
            this.loadingLocalizedProcessing = false;
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
            console.error('Error loading localized data:', err);
          }
        })

      },
      error: (err) => {
        this.loadingProcessingOptions = false; // Set to false in case of an error
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Verarbeitungsoptionen' });
        console.error('Error loading processing options:', err);
      }
    });
  }

  loadLocalizationData(): void {
    this.loadingLocalize = true; // Set to true when loading localization data
    this.nearbuyTestService.getData().subscribe({
      next: (result) => {
        this.localizationData = result;
        this.localizeService.getLevelsOfProcessing().subscribe({
          next: result => {
            this.localizationDataLOP = result; // Save localization data for later use
          },
          error: err => {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
          }
        });
        this.loadingLocalize = false; // Set to false after successful loading
      },
      error: (err) => {
        this.loadingLocalize = false; // Set to false in case of an error
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Übersetzungen' });
        console.error('Error loading localization data', err);
      }
    });
  }


  // Helper function to get localized display label for an ingredient
  getLocalizedLabel(ingredientName: string): string {
    const localizedItem = this.localizationData.find(item => item.value === ingredientName);
    return localizedItem ? localizedItem.displayLabel : ingredientName;
  }

  toggleExpandMenuPlan(menuPlanId: string): void {
    if (this.expandedMenuPlanId === menuPlanId) {
      this.expandedMenuPlanId = null;
      this.expandedConfigurationModal = false;
    } else {
      this.expandedMenuPlanId = menuPlanId;
      this.expandedConfigurationModal = true;
      this.selectedMenuPlanId = menuPlanId;
    }
  }

  isGroupedShoppingListEmpty(): boolean {
    return Object.keys(this.groupedShoppingList).length === 0;
}


getLoadingMessage(): string {
  if (this.loading) {
    return 'Lade Menüpläne...';
  } else if (this.loadingRecipes) {
    return 'Rezepte mit Zutaten werden geladen...';
  } else if (this.loadingLocalize || this.loadingLocalizedProcessing) {
    return 'Übersetzungen werden geladen...';
  } else if (this.loadingProcessingOptions) {
    return 'Verarbeitungsoptionen werden geladen...';
  }
  return '';
}

getUnitLabel(unitValue: string): string {
  const unit = ingredientUnits.find(u => u.value === unitValue);
  return unit ? unit.label : unitValue; // Return the label if found, else return the value itself
}

loadRecipesWithIngredients(menuPlanId: string): void {
  this.loadingRecipes = true; // Set to true when loading recipes
  const menuPlan = this.menuPlans.find(plan => plan.id === menuPlanId);

  if (menuPlan) {
    // Even if menuPlan has no recipes, proceed with setting loading to false after processing
    const recipeRequests: Observable<Recipe | null>[] = menuPlan.recipes.map((recipe: { id: string }) =>
      this.recipeService.getRecipeById(recipe.id, false).pipe(
        catchError(error => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden für Rezept ${recipe.id}` });
          console.error(`Error fetching recipe ${recipe.id}:`, error);
          return of(null); // Handle errors gracefully
        })
      )
    );

    // Use finalize to ensure loadingRecipes is reset
    forkJoin(recipeRequests)
      .pipe(
        finalize(() => {
          console.log(`Recipes with ingredients for menu plan ${menuPlanId} loaded successfully`);
          this.loadingRecipes = false; // Reset loading flag when operation completes
        })
      )
      .subscribe({
        next: (recipes: (Recipe | null)[]) => {
          // Keep all recipes, even if they have no ingredients
          this.recipesWithIngredients[menuPlanId] = recipes.filter((recipe): recipe is Recipe => recipe !== null);

          // Log which recipes are missing ingredients for debugging
          recipes.forEach(recipe => {
            if (recipe !== null && (!recipe.ingredients || recipe.ingredients.length === 0)) {
              this.messageService.add({severity: 'warn', summary: 'Hinweis', detail: 'Ein Rezept in einem Menüplan kann nicht mehr gefunden werden'})
              console.log(`Recipe ${recipe.id} in menu plan ${menuPlanId} has no ingredients.`);
            }
          });

          // Log if no recipes were found for a menu plan
          if (recipes.length === 0) {
            this.messageService.add({severity: 'info', summary: 'Hinweis', detail: 'Für den angegebenen Menüplan konnten keine Rezepte gefunden werden'})
            console.log(`No recipes found for menu plan ${menuPlanId}.`);
          }
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Rezepte mit Zutaten' });
          console.error('Error loading recipes with ingredients', error);
        }
      });
  } else {
    this.messageService.add({severity: 'info', summary: 'Hinweis', detail: 'Der angegebene Menüplan konnte nicht gefunden werden'})
    console.log(`No menu plan found for ID ${menuPlanId}.`);
    this.loadingRecipes = false; // If menuPlan is not found, reset the loading state
  }
}


  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.menuPlans.forEach(menuPlan => (menuPlan.selected = checked));
    this.updateSelectedMenuPlans();
  }
  

  createShoppingList(): void {
    const selectedMenuPlans = this.menuPlans.filter(plan => plan.selected);
    this.selectedMenuPlans = selectedMenuPlans;
    const shoppingListMap: { [key: string]: EnhancedIngredient[] } = {};
  
    selectedMenuPlans.forEach(menuPlan => {
      const recipes = this.recipesWithIngredients[menuPlan.id];
      if (recipes) {
        recipes.forEach(recipe => {
          recipe.ingredients.forEach((ingredient: Ingredient) => {
            // Add the main ingredient to the shopping list
            this.addIngredientToShoppingList(
              shoppingListMap, 
              ingredient, 
              recipe.recipeName, 
              false, // Not an alternative
              ingredient.optional // Pass the optional flag from the ingredient
            );
  
            // If alternatives are present, add them as well
            if (ingredient.alternatives && ingredient.alternatives.length > 0) {
              ingredient.alternatives.forEach(alternative => {
                const alternativeProcessing = alternative.processing || ingredient.processing || 'n/a';
                const alternativeIngredient: Ingredient = {
                  ...alternative,
                  processing: alternativeProcessing
                };
                this.addIngredientToShoppingList(
                  shoppingListMap, 
                  alternativeIngredient, 
                  recipe.recipeName, 
                  true, // This is an alternative
                  ingredient.optional // Pass the optional flag from the main ingredient
                );
              });
            }
          });
        });
      }
    });
  
    // Convert shoppingListMap into groupedShoppingList format
    this.groupedShoppingList = {};
    Object.entries(shoppingListMap).forEach(([name, ingredients]) => {
      this.groupedShoppingList[name] = ingredients.map(ingredient => {
        ingredient.totalInLargestUnit = this.calculateTotalInLargestUnit(ingredient.totalAmount, ingredient.unit);
        return ingredient;
      });
    });
  
    this.displayShoppingListDialog = true;
  }
  
  private addIngredientToShoppingList(
    shoppingListMap: { [key: string]: EnhancedIngredient[] },
    ingredient: Ingredient,
    recipeName: string,
    isAlternative: boolean = false,
    isOptional: boolean = false
  ): void {
    const key = ingredient.name;
    let amount = parseFloat(ingredient.amount as string);
    const processing = ingredient.processing || 'n/a';
    const unit = ingredient.unit;
  
    if (shoppingListMap[key]) {
      let foundCompatibleUnit = false;
  
      shoppingListMap[key].forEach(existingIngredient => {
        if (this.areUnitsCompatible(existingIngredient.unit, unit)) {
          if (this.isValidUnit(unit) && this.isValidUnit(existingIngredient.unit)) {
            try {
              const normalizedAmount = convert(amount).from(unit as Unit).to(existingIngredient.unit as Unit);
  
              if (existingIngredient.processingBreakdown[processing]) {
                existingIngredient.processingBreakdown[processing] += normalizedAmount;
              } else {
                existingIngredient.processingBreakdown[processing] = normalizedAmount;
              }
              existingIngredient.totalAmount += normalizedAmount;
              existingIngredient.sourceRecipes.push(recipeName);
              existingIngredient.isAlternative = existingIngredient.isAlternative || isAlternative;
              existingIngredient.optional = existingIngredient.optional || isOptional;
              foundCompatibleUnit = true;
            } catch (error) {
              console.error(`Error converting units: ${error}`);
            }
          } else if (unit === existingIngredient.unit) {
            // Same unit type (e.g., 'blocks' with 'blocks')
            if (existingIngredient.processingBreakdown[processing]) {
              existingIngredient.processingBreakdown[processing] += amount;
            } else {
              existingIngredient.processingBreakdown[processing] = amount;
            }
            existingIngredient.totalAmount += amount;
            existingIngredient.sourceRecipes.push(recipeName);
            existingIngredient.isAlternative = existingIngredient.isAlternative || isAlternative;
            existingIngredient.optional = existingIngredient.optional || isOptional;
            foundCompatibleUnit = true;
          }
        }
      });
  
      if (!foundCompatibleUnit) {
        shoppingListMap[key].push({
          name: ingredient.name,
          unit: unit,
          totalAmount: amount,
          sourceRecipes: [recipeName],
          category: this.getCategory(unit),
          convertible: this.isValidUnit(unit),
          processingBreakdown: { [processing]: amount },
          totalInLargestUnit: this.calculateTotalInLargestUnit(amount, unit),
          isAlternative: isAlternative,
          optional: isOptional
        });
      }
    } else {
      shoppingListMap[key] = [{
        name: ingredient.name,
        unit: unit,
        totalAmount: amount,
        sourceRecipes: [recipeName],
        category: this.getCategory(unit),
        convertible: this.isValidUnit(unit),
        processingBreakdown: { [processing]: amount },
        totalInLargestUnit: this.calculateTotalInLargestUnit(amount, unit),
        isAlternative: isAlternative,
        optional: isOptional
      }];
    }
  }
  
  
  areUnitsCompatible(unit1: string, unit2: string): boolean {
    // Check if both units are mass units
    if (this.isMassUnit(unit1) && this.isMassUnit(unit2)) return true;

    // Check if both units are volume units
    if (this.isVolumeUnit(unit1) && this.isVolumeUnit(unit2)) return true;

    // Check if both units are the same discrete type
    if (unit1 === unit2) return true;

    // Otherwise, they are not compatible
    return false;
  }

  updateSelectedMenuPlans(): void {
    this.selectedMenuPlans = this.menuPlans.filter(plan => plan.selected);
  }

  calculateTotalInLargestUnit(totalAmount: number, unit: string): string {
    const germanUnits = {
      volume: ['ml', 'l'],  // Preferred volume units in German
      mass: ['g', 'kg'],    // Preferred mass units in German
      others: [],           // Add an empty array for 'others'
    };
  
    try {
      const category = this.getCategory(unit);
      const possibilities = germanUnits[category] || convert().from(unit as Unit).possibilities();
  
      const largestUnit = possibilities.reduce((prev, curr) => {
        try {
          const converted = convert(totalAmount).from(unit as Unit).to(curr as Unit);
          return converted >= 1 ? curr : prev;
        } catch (error) {
          return prev;
        }
      }, unit);
  
      const convertedAmount = convert(totalAmount).from(unit as Unit).to(largestUnit as Unit);
      return `${convertedAmount.toFixed(2)} ${largestUnit}`;
    } catch (error) {
      unit = this.getUnitLabel(unit)
      return `${totalAmount} ${unit}`; // Fallback in case of error
    }
  }

  updateAmount(item: EnhancedIngredient, process: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.trim(); // Trim whitespace
    const newValue = parseFloat(inputValue);
    const originalValue = item.processingBreakdown[process];

    // Initialize the errorMessages object if it doesn't exist
    if (!item.errorMessages) {
        item.errorMessages = {};
    }

    // Handle empty input
    if (inputValue === '') {
        item.errorMessages[process] = `Bitte valider Wert für ${item.name}.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // Handle NaN (not a number)
    if (isNaN(newValue)) {
        item.errorMessages[process] = `Bitte valider Wert für ${item.name}.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // Handle non-positive numbers
    if (newValue <= 0) {
        item.errorMessages[process] = `Wert muss größer als 0 sein für ${item.name}.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // Handle absurdly large values
    if (newValue > 10000) { // Example absurd number threshold, can be adjusted as needed
        item.errorMessages[process] = `Wert zu groß für ${item.name}. Bitte kleinere Menge.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // If input is valid, update the amount for the specific processing type
    item.processingBreakdown[process] = newValue;

    // Recalculate the total amount for this ingredient
    item.totalAmount = Object.values(item.processingBreakdown).reduce((sum, amt) => sum + amt, 0);

    // Recalculate the total in the largest unit
    item.totalInLargestUnit = this.calculateTotalInLargestUnit(item.totalAmount, item.unit);

    // Remove any previous error states or messages
    inputElement.classList.remove('invalid-input');
    delete item.errorMessages[process]; // Clear the error message for this process if valid
}


  deleteIngredient(group: string, process: string, index: number): void {
    const ingredient = this.groupedShoppingList[group][index];
    
    // Check if the processing type exists and delete it
    if (ingredient.processingBreakdown[process] !== undefined) {
      delete ingredient.processingBreakdown[process];
    }

    // Recalculate the total amount
    ingredient.totalAmount = Object.values(ingredient.processingBreakdown).reduce((sum, amt) => sum + amt, 0);

    // If no more processing types are left, remove the entire ingredient from the list
    if (Object.keys(ingredient.processingBreakdown).length === 0) {
      this.groupedShoppingList[group].splice(index, 1);
      if (this.groupedShoppingList[group].length === 0) {
        delete this.groupedShoppingList[group];
      }
    }
  }


  getGroupKeys(): string[] {
    return Object.keys(this.groupedShoppingList);
  }

  getProcessingString(item: EnhancedIngredient): string {
    const validEntries = Object.entries(item.processingBreakdown)
        .filter(([process]) => process !== 'n/a');

    const noProcessingEntries = Object.entries(item.processingBreakdown)
        .filter(([process]) => process === 'n/a');

    if (validEntries.length === 0 && noProcessingEntries.length > 0) {
        return ''; // Return an empty string if only 'n/a' entries exist
    }

    let result = validEntries
        .map(([process, amt]) => `${amt}${item.unit} ${process}`)
        .join(' / ');

    if (noProcessingEntries.length > 0) {
        const noProcessingAmount = noProcessingEntries
            .map(([_, amt]) => `${amt}${item.unit}`)
            .join(' / ');

        result += ` / ${noProcessingAmount} keine Angabe`;
    }

    return result;
}


  getCategory(unit: string): 'mass' | 'volume' | 'others' {
    if (this.isMassUnit(unit)) {
      return 'mass';
    } else if (this.isVolumeUnit(unit)) {
      return 'volume';
    } else {
      return 'others';
    }
  }

  isMassUnit(unit: string): boolean {
    return convert().possibilities('mass').includes(unit as Unit);
  }
  
  isVolumeUnit(unit: string): boolean {
    return convert().possibilities('volume').includes(unit as Unit);
  }
  
  isValidUnit(unit: string): unit is Unit {
    const validUnits = [
      ...convert().possibilities('mass'),
      ...convert().possibilities('volume'),
      ...convert().possibilities('length'),
      ...convert().possibilities('temperature'),
      // Add other measurement types as needed
    ];
    return validUnits.includes(unit as Unit);
  }

  onBuyClick(menuPlan: any): void {
    console.log('Buy button clicked for menu plan:', menuPlan);
  }

  onBuyIngredientClick(ingredient: Ingredient): void {
    console.log('Buy button clicked for ingredient:', ingredient);
  }
  getProcessingTypes(item: EnhancedIngredient): string[] {
    return Object.keys(item.processingBreakdown);
  }


  getUnitOptions(currentUnit: string): { label: string, value: string }[] {
    const categories = ['mass', 'volume'];
    let options: { label: string, value: string }[] = [];
  
    categories.forEach(category => {
      const units = convert().possibilities(category as any);
      options = options.concat(units.map(unit => ({ label: unit, value: unit })));
    });
  
    return options;
  }
  saveShoppingList(): void {
    if (this.isGroupedShoppingListEmpty()) {
      this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Einkaufszettel kann nicht leer sein'})
      return
    }
      
    const simplifiedMenuPlans = this.selectedMenuPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        recipes: plan.recipes.map((recipe: any) => ({
            id: recipe.id,
            name: recipe.name
        }))
    }));

    const shoppingListObject = {
        menuPlans: simplifiedMenuPlans,
        groupedShoppingList: this.groupedShoppingList,
        createdAt: new Date(),
        createdBy: 'admin', // Replace with actual user
        updatedAt: new Date()
    };

    // Send to the backend via the service
    this.shoppingListService.saveShoppingList(shoppingListObject).subscribe(
      response => {
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Einkaufszettel gespeichert' });
        this.displayShoppingListDialog = false
        this.groupedShoppingList = {}
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Speichern des Einkaufszettel' });
      }
    );
  }
  gotoDetails(menuplan:any)
  {
    this.router.navigate(["menu-planning/my-menus/details", menuplan.id])
  }

  uniqueSourceRecipes(recipes: string[]): string {
    // Use Set to remove duplicates and join them with commas
    return Array.from(new Set(recipes)).join(', ');
  }
  hidePortionDetails() {
    this.hoveredMenuPlanId = null;
  }

  // Calculate the total portions (sum of regular, vegan, and vegetarian)
  getTotalPortions(menuPlan: any): number {
      return (menuPlan.portions || 0) + (menuPlan.portionsVegan || 0) + (menuPlan.portionsVegetarisch || 0);
  }

  // Show tooltip with portion details
  showPortionDetails(menuPlan: any) {
    this.hoveredMenuPlanId = menuPlan.id;
  }
  getTranslatedRepeatFrequency(repeatFrequency: string): string {
    const foundOption = this.repeatOptions.find(option => option.value === repeatFrequency);
    return foundOption ? foundOption.label : repeatFrequency; // Return label if found, otherwise the value itself
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
}
