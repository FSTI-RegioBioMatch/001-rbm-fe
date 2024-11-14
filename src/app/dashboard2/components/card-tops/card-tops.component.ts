import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NewMenuplanService } from '../../../shared/services/new-menuplan.service';
import { RecipeService } from '../../../shared/services/recipe.service';
import { StoreService } from '../../../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RecipeType, Ingredient } from '../../../shared/types/recipe.type';
import { MenuplanType } from '../../../shared/types/menuplan.type';
import { filter, map, switchMap, catchError, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

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

@Component({
  selector: 'app-card-tops',
  standalone: true,
  imports: [CommonModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './card-tops.component.html',
  styleUrl: './card-tops.component.scss',
})
@Component({
  selector: 'app-card-tops',
  standalone: true,
  imports: [CommonModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './card-tops.component.html',
  styleUrl: './card-tops.component.scss',
})
export class CardTopsComponent implements OnInit {
  loading = true;
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
  ) {
    console.log('Constructor called');
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadTopStats();
  }

  private loadTopStats(): void {
    this.loading = true;
    console.log('Starting to load stats');

    // Direct service calls since they handle company context internally
    forkJoin({
      menuPlans: this.menuPlanService.getAllMenuPlans(),
      recipes: this.recipeService.getRecipesByCompanyContext(),
    })
      .pipe(
        tap({
          next: (data) => console.log('Received data:', data),
          error: (error) => console.error('Error in forkJoin:', error),
        }),
        map(({ menuPlans, recipes }) => {
          console.log('Processing menuPlans:', menuPlans);
          console.log('Processing recipes:', recipes);

          const menuCounts = new Map<string, number>();
          const recipeCounts = new Map<string, number>();
          const articleCounts = new Map<string, TopArticle>();

          // Process menu plans
          if (Array.isArray(menuPlans)) {
            menuPlans.forEach((plan) => {
              if (!plan?.name) return;
              menuCounts.set(plan.name, (menuCounts.get(plan.name) || 0) + 1);

              if (Array.isArray(plan.recipes)) {
                plan.recipes.forEach((recipe: RecipeType) => {
                  const recipeTitle = recipe?.title || recipe?.recipeName;
                  if (!recipeTitle) return;
                  recipeCounts.set(
                    recipeTitle,
                    (recipeCounts.get(recipeTitle) || 0) + 1,
                  );

                  if (Array.isArray(recipe.ingredients)) {
                    recipe.ingredients.forEach((ingredient: Ingredient) => {
                      if (!ingredient?.name || !ingredient?.unit) return;

                      const key = `${ingredient.name}-${ingredient.unit}`;
                      const current = articleCounts.get(key) || {
                        name: ingredient.name,
                        count: 0,
                        unit: ingredient.unit,
                      };

                      const amount = Number(ingredient.amount) || 0;
                      articleCounts.set(key, {
                        name: ingredient.name,
                        count: current.count + amount,
                        unit: ingredient.unit,
                      });
                    });
                  }
                });
              }
            });
          }

          // Process individual recipes
          if (Array.isArray(recipes)) {
            recipes.forEach((recipe: RecipeType) => {
              const recipeTitle = recipe?.title || recipe?.recipeName;
              if (!recipeTitle) return;

              recipeCounts.set(
                recipeTitle,
                (recipeCounts.get(recipeTitle) || 0) + 1,
              );

              if (Array.isArray(recipe.ingredients)) {
                recipe.ingredients.forEach((ingredient: Ingredient) => {
                  if (!ingredient?.name || !ingredient?.unit) return;

                  const key = `${ingredient.name}-${ingredient.unit}`;
                  const current = articleCounts.get(key) || {
                    name: ingredient.name,
                    count: 0,
                    unit: ingredient.unit,
                  };

                  const amount = Number(ingredient.amount) || 0;
                  articleCounts.set(key, {
                    name: ingredient.name,
                    count: current.count + amount,
                    unit: ingredient.unit,
                  });
                });
              }
            });
          }

          console.log('Processed data:', {
            menus: menuCounts,
            recipes: recipeCounts,
            articles: articleCounts,
          });

          return {
            menus: this.getTopItems(menuCounts),
            recipes: this.getTopItems(recipeCounts),
            articles: Array.from(articleCounts.values())
              .sort((a, b) => b.count - a.count)
              .slice(0, 5),
          } as TopStats;
        }),
        catchError((error) => {
          console.error('Error processing stats:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Laden der Statistiken',
          });
          return of({
            menus: [],
            recipes: [],
            articles: [],
          } as TopStats);
        }),
      )
      .subscribe({
        next: (stats) => {
          console.log('Final stats:', stats);
          this.topItems = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Subscription error:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Fehler beim Laden der Statistiken',
          });
        },
        complete: () => {
          console.log('Stats loading completed');
          this.loading = false;
        },
      });
  }

  private getTopItems(countMap: Map<string, number>): TopItem[] {
    return Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}
