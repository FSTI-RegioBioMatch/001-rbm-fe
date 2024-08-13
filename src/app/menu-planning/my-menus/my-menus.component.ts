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
}


@Component({
  selector: 'app-my-menus',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    TooltipModule
  ],
  templateUrl: './my-menus.component.html',
  styleUrl: './my-menus.component.scss'
})
export class MyMenusComponent implements OnInit {
  menuPlans: any[] = [];
  expandedMenuPlanId: string | null = null;
  recipesWithIngredients: { [key: string]: Recipe[] } = {};
  selectedMenuPlans: any[] = [];
  groupedShoppingList: { [name: string]: EnhancedIngredient[] } = {}; // Grouped by ingredient name

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
    private store: StoreService
  ) {}

  ngOnInit(): void {
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
        },
        error: (error) => {
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
            console.error(`Error fetching recipe ${recipe.id}:`, error);
            return of(null); // Handle errors gracefully
          })
        )
      );

      forkJoin(recipeRequests).subscribe({
        next: (recipes: (Recipe | null)[]) => {
          this.recipesWithIngredients[menuPlanId] = recipes.filter((recipe): recipe is Recipe => recipe !== null);
        },
        error: (error) => {
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

                    // Check if this ingredient already exists in the shopping list map
                    if (shoppingListMap[key]) {
                        let foundCompatibleUnit = false;

                        // Look for an existing ingredient with a compatible unit
                        shoppingListMap[key].forEach(existingIngredient => {
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
                            }
                        });

                        if (!foundCompatibleUnit) {
                            // If no compatible unit is found, create a new entry for this unit
                            shoppingListMap[key].push({
                                name: ingredient.name,
                                unit: unit,
                                totalAmount: amount,
                                sourceRecipes: [recipe.recipeName],
                                category: this.getCategory(unit),
                                convertible: this.isValidUnit(unit),
                                processingBreakdown: {
                                    [processing]: amount
                                }
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
                            }
                        }];
                    }
                });
            });
        }
    });

    // Group by ingredient name
    this.groupedShoppingList = {};
    Object.entries(shoppingListMap).forEach(([name, ingredients]) => {
        this.groupedShoppingList[name] = ingredients;
    });

    console.log('Grouped Einkaufsliste:', this.groupedShoppingList);
}  

  updateAmount(item: EnhancedIngredient, process: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const newValue = parseFloat(inputElement.value);

    if (!isNaN(newValue) && item.processingBreakdown[process] !== undefined) {
        // Update the amount for the specific processing type
        item.processingBreakdown[process] = newValue;
        // Recalculate the total amount for this ingredient
        item.totalAmount = Object.values(item.processingBreakdown).reduce((sum, amt) => sum + amt, 0);
    }
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

  updateUnit(item: EnhancedIngredient, newUnit: Unit): void {
    if (item.unit !== newUnit && this.isValidUnit(newUnit)) {
        // Convert all amounts in the processing breakdown to the new unit
        const conversionFactor = convert(1).from(item.unit as Unit).to(newUnit);

        // Update the processing breakdown with the new unit
        item.processingBreakdown = Object.fromEntries(
            Object.entries(item.processingBreakdown).map(([process, amt]) => [process, amt * conversionFactor])
        );

        // Update the unit
        item.unit = newUnit;

        // Update the amount to the new unit's total
        item.totalAmount = Object.values(item.processingBreakdown).reduce((sum, amt) => sum + amt, 0);

        // Check if there are other items in the same group with the same new unit
        const groupName = item.name;
        const sameUnitItems = this.groupedShoppingList[groupName].filter(otherItem => otherItem.unit === newUnit && otherItem !== item);

        if (sameUnitItems.length > 0) {
            sameUnitItems.forEach(sameUnitItem => {
                // Merge the processing breakdowns
                Object.entries(sameUnitItem.processingBreakdown).forEach(([process, amt]) => {
                    if (item.processingBreakdown[process]) {
                        item.processingBreakdown[process] += amt;
                    } else {
                        item.processingBreakdown[process] = amt;
                    }
                });

                // Update the total amount
                item.totalAmount = Object.values(item.processingBreakdown).reduce((sum, amt) => sum + amt, 0);

                // Remove the merged item
                const index = this.groupedShoppingList[groupName].indexOf(sameUnitItem);
                if (index > -1) {
                    this.groupedShoppingList[groupName].splice(index, 1);
                }
            });
        }
    }
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
    const shoppingListObject = {
        menuPlans: this.selectedMenuPlans,
        groupedShoppingList: this.groupedShoppingList,
        createdAt: new Date(),
        createdBy: 'admin', // Replace with actual user
        updatedAt: new Date()
    };

    console.log('Gespeicherte Einkaufsliste:', shoppingListObject);
  }
}
