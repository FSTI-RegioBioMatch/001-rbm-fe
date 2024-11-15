import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NewMenuplanService } from '../../../shared/services/new-menuplan.service';
import { RecipeService } from '../../../shared/services/recipe.service';
import { StoreService } from '../../../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RecipeType, Ingredient } from '../../../shared/types/recipe.type';
import { ChangeDetectorRef } from '@angular/core';
import {
  filter,
  map,
  switchMap,
  catchError,
  take,
  finalize,
} from 'rxjs/operators';
import { of } from 'rxjs';

interface TopItem {
  name: string;
  count: number;
}

interface TopArticle {
  name: string;
  count: number;
  unit: string;
}

interface TopStats {
  articles: TopArticle[];
  recipes: TopItem[];
  menus: TopItem[];
}

interface MenuItem {
  id: string;
  name: string;
}

interface MenuPlan {
  id: string;
  name: string;
  recipes: MenuItem[];
}

interface RecipeResponse {
  content: RecipeType[];
  totalElements: number;
  totalPages: number;
}

@Component({
  selector: 'app-card-tops',
  standalone: true,
  imports: [CommonModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './card-tops.component.html',
  styleUrl: './card-tops.component.scss',
})
export class CardTopsComponent implements OnInit {
  loading = {
    menus: true,
    recipes: true,
  };

  topItems: TopStats = {
    articles: [],
    recipes: [],
    menus: [],
  };

  constructor(
    private menuPlanService: NewMenuplanService,
    private recipeService: RecipeService,
    private storeService: StoreService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.processMenus();
    this.processRecipes();
  }

  trackByName(index: number, item: TopItem): string {
    return item.name;
  }

  private processMenus(): void {
    this.loading.menus = true;

    this.storeService.selectedCompanyContext$
      .pipe(
        filter((company) => company !== null && company.id !== undefined),
        take(1),
        switchMap(() => this.menuPlanService.getAllMenuPlans()),
        map((menuPlans: MenuPlan[]) => {
          console.log('Received menu plans:', menuPlans);
          const menuCounts = new Map<string, number>();

          if (Array.isArray(menuPlans)) {
            menuPlans.forEach((plan: MenuPlan) => {
              if (!plan?.name) return;
              menuCounts.set(plan.name, (menuCounts.get(plan.name) || 0) + 1);

              if (plan.recipes) {
                plan.recipes.forEach((recipe: MenuItem) => {
                  console.log('Processing recipe from menu:', recipe);
                });
              }
            });
          }

          return {
            menus: this.getTopItems(menuCounts),
          };
        }),
        catchError((error) => {
          console.error('Error processing menus:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Laden der Menüs',
          });
          return of({
            menus: [],
          });
        }),
        finalize(() => {
          this.loading.menus = false;
        }),
      )
      .subscribe((result) => {
        console.log('Menu processing result before set:', result);
        this.topItems.menus = [...(result.menus || [])];
        this.cdr.detectChanges();
        console.log('TopItems after menu update:', this.topItems);
      });
  }

  private processRecipes(): void {
    this.loading.recipes = true;

    this.storeService.selectedCompanyContext$
      .pipe(
        filter((company) => company !== null && company.id !== undefined),
        take(1),
        switchMap(() => this.recipeService.getRecipesByCompanyContext()),
        map((response: any) => {
          console.log('Full response:', response);

          const recipes = response.content || response;
          console.log('Recipes array:', recipes);

          const recipeCounts = new Map<string, number>();
          const articleCounts = new Map<string, TopArticle>();
          console.log('article counts', articleCounts);

          if (Array.isArray(recipes)) {
            recipes.forEach((recipe: RecipeType) => {
              console.log('Processing recipe:', recipe);

              const recipeTitle = recipe.recipeName;
              console.log('Recipe title:', recipeTitle);

              if (recipeTitle) {
                recipeCounts.set(
                  recipeTitle,
                  (recipeCounts.get(recipeTitle) || 0) + 1,
                );

                if (recipe.ingredients && recipe.ingredients.length > 0) {
                  console.log(
                    'Processing ingredients for recipe:',
                    recipeTitle,
                  );
                  recipe.ingredients.forEach((ingredient: Ingredient) => {
                    if (!ingredient.name || !ingredient.unit) {
                      console.log(
                        'Skipping ingredient due to missing name or unit:',
                        ingredient,
                      );
                      return;
                    }

                    const key = `${ingredient.name}-${ingredient.unit}`;
                    const current = articleCounts.get(key) || {
                      name: ingredient.name,
                      count: 0,
                      unit: ingredient.unit,
                    };

                    let amount = 0;
                    if (typeof ingredient.amount === 'string') {
                      const match = ingredient.amount.match(/\d+/);
                      amount = match ? Number(match[0]) : 0;
                      console.log(
                        'Parsed string amount:',
                        ingredient.amount,
                        'to:',
                        amount,
                      );
                    } else {
                      amount = Number(ingredient.amount) || 0;
                      console.log('Parsed number amount:', amount);
                    }

                    articleCounts.set(key, {
                      name: ingredient.name,
                      count: current.count + amount,
                      unit: ingredient.unit,
                    });
                  });
                }
              }
            });
          }

          console.log('Final counts:', {
            recipes: Array.from(recipeCounts.entries()),
            articles: Array.from(articleCounts.entries()),
          });

          return {
            recipes: this.getTopItems(recipeCounts),
            articles: Array.from(articleCounts.values())
              .sort((a, b) => b.count - a.count)
              .slice(0, 5),
          };
        }),
        catchError((error) => {
          console.error('Error processing recipes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Laden der Rezepte',
          });
          return of({
            recipes: [],
            articles: [],
          });
        }),
        finalize(() => {
          this.loading.recipes = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((result) => {
        console.log('Recipe processing result before set:', result);
        this.topItems.recipes = [...(result.recipes || [])];
        this.topItems.articles = [...(result.articles || [])];
        this.cdr.detectChanges();
        console.log('TopItems after recipe update:', this.topItems);
      });
  }

  private getTopItems(countMap: Map<string, number>): TopItem[] {
    return Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
