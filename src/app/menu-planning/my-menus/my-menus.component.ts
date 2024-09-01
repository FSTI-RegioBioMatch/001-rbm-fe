import { Component, OnInit } from '@angular/core';
import { NewMenuplanService } from '../../shared/services/new-menuplan.service';
import { RecipeService } from '../../shared/services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, switchMap, forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

interface Ingredient {
  name: string;
  unit: string;
  amount: string | number;
  processing?: string;  // Processing method like 'ganz', 'geschnitten', etc.
  combinedAmount?: string;  // For storing combined amounts with processing details
}

interface Recipe {
  id: string;
  recipeName: string;
  ingredients: Ingredient[];
}

interface EnhancedIngredient {
  name: string;
  unit: string;
  totalAmount: number; // New property to hold the total amount
  sourceRecipes: string[]; // List of recipes that use this ingredient
  category: 'mass' | 'volume' | 'others';
  convertible: boolean; // Whether the unit was convertible
  processingBreakdown: { [processing: string]: number }; // Breakdown of amounts by processing method
  totalInLargestUnit?: string;
  errorMessages?: { [processing: string]: string };
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
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './my-menus.component.html',
  styleUrl: './my-menus.component.scss'
})
export class MyMenusComponent implements OnInit {

  menuPlans: any[] = [];
  expandedMenuPlanId: string | null = null;
  recipesWithIngredients: { [key: string]: Recipe[] } = {};
  selectedMenuPlans: any[] = [];
  groupedShoppingList: { [name: string]: EnhancedIngredient[] } = {}; // Grouped by ingredient name

  loading = false;

  processingOptions = [
    { label: 'Ganz', value: 'ganz' },
    { label: 'Geschält', value: 'geschält' },
    { label: 'Geschnitten', value: 'geschnitten' },
    { label: 'Getrocknet', value: 'getrocknet' },
    { label: 'Gewaschen', value: 'gewaschen' }
  ];

  constructor(
    private menuPlanService: NewMenuplanService,
    private recipeService: RecipeService,
    private store: StoreService,
    private shoppingListService: NewShoppingListService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company => this.menuPlanService.getAllMenuPlans())
      )
      .subscribe({
        next: (data) => {
          this.menuPlans = data;
          this.menuPlans.forEach(menuPlan => {
            this.loadRecipesWithIngredients(menuPlan.id);
          });
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading menu plans' });
          console.error('Error loading menu plans', error);
        }
      });
  }

  toggleExpandMenuPlan(menuPlanId: string): void {
    if (this.expandedMenuPlanId === menuPlanId) {
      this.expandedMenuPlanId = null;
    } else {
      this.expandedMenuPlanId = menuPlanId;
    }
  }

  loadRecipesWithIngredients(menuPlanId: string): void {
    const menuPlan = this.menuPlans.find(plan => plan.id === menuPlanId);
    if (menuPlan) {
      const recipeRequests: Observable<Recipe | null>[] = menuPlan.recipes.map((recipe: { id: string }) =>
        this.recipeService.getRecipeById(recipe.id).pipe(
          catchError(error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error fetching recipe ${recipe.id}` });
            console.error(`Error fetching recipe ${recipe.id}:`, error);
            return of(null); // Handle errors gracefully
          })
        )
      );
      forkJoin(recipeRequests).subscribe({
        next: (recipes: (Recipe | null)[]) => {
          this.recipesWithIngredients[menuPlanId] = recipes.filter((recipe): recipe is Recipe => recipe !== null);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error loading recipes with ingredients' });
          console.error('Error loading recipes with ingredients:', error);
        }
      });
    }
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.menuPlans.forEach(menuPlan => menuPlan.selected = checked);
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
                                        existingIngredient.sourceRecipes.push(recipe.recipeName);
                                        foundCompatibleUnit = true;
                                    } catch (error) {
                                        // Incompatible units, do nothing
                                    }
                                } else if (unit === existingIngredient.unit) {
                                    // Same unit type (e.g., 'blocks' with 'blocks')
                                    if (existingIngredient.processingBreakdown[processing]) {
                                        existingIngredient.processingBreakdown[processing] += amount;
                                    } else {
                                        existingIngredient.processingBreakdown[processing] = amount;
                                    }
                                    existingIngredient.totalAmount += amount;
                                    existingIngredient.sourceRecipes.push(recipe.recipeName);
                                    foundCompatibleUnit = true;
                                }
                            }
                        });

                        if (!foundCompatibleUnit) {
                            shoppingListMap[key].push({
                                name: ingredient.name,
                                unit: unit,
                                totalAmount: amount,
                                sourceRecipes: [recipe.recipeName],
                                category: this.getCategory(unit),
                                convertible: this.isValidUnit(unit),
                                processingBreakdown: {
                                    [processing]: amount
                                },
                                totalInLargestUnit: this.calculateTotalInLargestUnit(amount, unit)
                            });
                        }
                    } else {
                        shoppingListMap[key] = [{
                            name: ingredient.name,
                            unit: unit,
                            totalAmount: amount,
                            sourceRecipes: [recipe.recipeName],
                            category: this.getCategory(unit),
                            convertible: this.isValidUnit(unit),
                            processingBreakdown: {
                                [processing]: amount
                            },
                            totalInLargestUnit: this.calculateTotalInLargestUnit(amount, unit)
                        }];
                    }
                });
            });
        }
    });

    this.groupedShoppingList = {};
    Object.entries(shoppingListMap).forEach(([name, ingredients]) => {
        this.groupedShoppingList[name] = ingredients.map(ingredient => {
            ingredient.totalInLargestUnit = this.calculateTotalInLargestUnit(ingredient.totalAmount, ingredient.unit);
            return ingredient;
        });
    });

    console.log('Grouped Einkaufsliste:', this.groupedShoppingList);
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
        item.errorMessages[process] = `Input cannot be empty. Please enter a valid number for ${item.name}.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // Handle NaN (not a number)
    if (isNaN(newValue)) {
        item.errorMessages[process] = `Invalid input. Please enter a valid number for ${item.name}.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // Handle non-positive numbers
    if (newValue <= 0) {
        item.errorMessages[process] = `Value must be greater than zero for ${item.name}.`;
        inputElement.classList.add('invalid-input');
        inputElement.value = originalValue.toString();
        return;
    }

    // Handle absurdly large values
    if (newValue > 10000) { // Example absurd number threshold, can be adjusted as needed
        item.errorMessages[process] = `Value too large for ${item.name}. Please enter a smaller number.`;
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
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Shopping list saved successfully' });
        console.log('Shopping list saved successfully:', response);
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save shopping list' });
        console.error('Error saving shopping list:', error);
      }
    );
  }
  gotoDetails(menuplan:any)
  {
    console.log("will go to", menuplan)
    this.router.navigate(["menu-planning/my-menus/details", menuplan.id])
  }

}
