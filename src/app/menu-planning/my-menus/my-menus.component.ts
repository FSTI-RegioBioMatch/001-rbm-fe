import { Component, OnInit } from '@angular/core';
import { NewMenuplanService } from '../../shared/services/new-menuplan.service';
import { RecipeService } from '../../shared/services/recipe.service'; // Import RecipeService
import { CommonModule } from '@angular/common';
import { filter, switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StoreService } from '../../shared/store/store.service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-my-menus',
  standalone: true,
  imports: [CommonModule,
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
  recipesWithIngredients: { [key: string]: any[] } = {};

  processingOptions = [
    { label: 'Ganz', value: 'ganz' },
    { label: 'Geschält', value: 'geschält' },
    { label: 'Geschnitten', value: 'geschnitten' },
    { label: 'Getrocknet', value: 'getrocknet' },
    { label: 'Gewaschen', value: 'gewaschen' }
  ];

  constructor(
    private menuPlanService: NewMenuplanService,
    private recipeService: RecipeService, // Inject RecipeService
    private store: StoreService
  ) {}

  ngOnInit(): void {
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company =>
          this.menuPlanService.getAllMenuPlans()
        )
      )
      .subscribe({
        next: (data) => {
          this.menuPlans = data;
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

      if (!this.recipesWithIngredients[menuPlanId]) {
        this.loadRecipesWithIngredients(menuPlanId);
      }
    }
  }

  loadRecipesWithIngredients(menuPlanId: string): void {
    const menuPlan = this.menuPlans.find(plan => plan.id === menuPlanId);

    if (menuPlan) {
      const recipeRequests = menuPlan.recipes.map((recipe: { id: string; }) =>
        this.recipeService.getRecipeById(recipe.id).pipe(
          catchError(error => {
            console.error(`Error fetching recipe ${recipe.id}:`, error);
            return of(null); // Handle errors gracefully
          })
        )
      );

      forkJoin(recipeRequests).subscribe({
        next: (value: unknown) => {
          const recipes = value as any[];
          this.recipesWithIngredients[menuPlanId] = recipes.filter((recipe: null) => recipe !== null);
        },
        error: (error) => {
          console.error('Error loading recipes with ingredients:', error);
        }
      });
    }
  }
  onBuyClick(menuPlan: any): void {
    console.log('Buy button clicked for menu plan:', menuPlan);
    // Implement the buy logic here
  }

  onBuyIngredientClick(ingredient: any): void {
    console.log('Buy button clicked for ingredient:', ingredient);
    // Implement the buy logic here
  }
}
