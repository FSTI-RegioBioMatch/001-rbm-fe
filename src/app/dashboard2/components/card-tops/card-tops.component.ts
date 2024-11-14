import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { NewMenuplanService } from '../../../shared/services/new-menuplan.service';
import { RecipeService } from '../../../shared/services/recipe.service';
import { StoreService } from '../../../shared/store/store.service';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface TopItem {
  name: string;
  count: number;
}

interface TopStats {
  articles: TopItem[];
  recipes: TopItem[];
  menus: TopItem[];
}

interface MenuPlan {
  id: string;
  name: string;
  recipes?: Array<{
    title: string;
    ingredients?: Array<{
      name: string;
      quantity: string;
      unit: string;
    }>;
  }>;
}

@Component({
  selector: 'app-card-tops',
  standalone: true,
  imports: [CommonModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './card-tops.component.html',
  styleUrl: './card-tops.component.scss',
})
export class CardTopsComponent {
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
  ) {}

  ngOnInit(): void {
    this.loadTopStats();
  }

  private loadTopStats(): void {
    this.storeService.selectedCompanyContext$.subscribe((company) => {
      if (company) {
        this.loading = true;

        // Use getAllMenuPlans instead of getMenuPlans
        this.menuPlanService.getAllMenuPlans().subscribe(
          (menuPlans: MenuPlan[]) => {
            // Process menu plans for top menus
            const menuCounts = new Map<string, number>();
            menuPlans.forEach((plan: MenuPlan) => {
              const count = menuCounts.get(plan.name) || 0;
              menuCounts.set(plan.name, count + 1);
            });

            this.topItems.menus = Array.from(menuCounts.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            // Process recipes from menu plans
            const recipeCounts = new Map<string, number>();
            const articleCounts = new Map<
              string,
              { name: string; weight: number }
            >();

            menuPlans.forEach((plan: MenuPlan) => {
              // Count recipes
              plan.recipes?.forEach((recipe) => {
                const count = recipeCounts.get(recipe.title) || 0;
                recipeCounts.set(recipe.title, count + 1);

                // Sum up ingredients
                recipe.ingredients?.forEach((ingredient) => {
                  const current = articleCounts.get(ingredient.name) || {
                    name: ingredient.name,
                    weight: 0,
                  };
                  // Convert quantity to number and add
                  const weight = parseFloat(ingredient.quantity) || 0;
                  articleCounts.set(ingredient.name, {
                    name: ingredient.name,
                    weight: current.weight + weight,
                  });
                });
              });
            });

            // Set top recipes
            this.topItems.recipes = Array.from(recipeCounts.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            // Set top articles
            this.topItems.articles = Array.from(articleCounts.values())
              .map((item) => ({
                name: item.name,
                count: Math.round(item.weight),
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            this.loading = false;
          },
          (error: Error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Fehler',
              detail: 'Fehler beim Laden der Statistiken',
            });
            this.loading = false;
            console.error('Error loading statistics:', error);
          },
        );
      }
    });
  }
}
