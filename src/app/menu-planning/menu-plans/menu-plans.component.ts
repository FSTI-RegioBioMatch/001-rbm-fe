import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuplanService } from '../../shared/services/menuplan.service';
import { MenuplanType } from '../../shared/types/menuplan.type';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Ingredient } from '../../shared/types/recipe.type';
import { ShoppingListService } from '../../shared/services/shopping-list.service';

@Component({
  selector: 'app-menu-plans',
  standalone: true,
  imports: [RouterLink, JsonPipe, TableModule, Button],
  templateUrl: './menu-plans.component.html',
  styleUrl: './menu-plans.component.scss',
})
export class MenuPlansComponent implements OnInit {
  @ViewChild('menuPlanTable') table: any;

  menuPlans: MenuplanType[] = [];
  rows: MenuplanType[] = [];
  selectedMenuPlans: MenuplanType[] = [];

  expanded: any = {};
  timeout: any;

  constructor(
    private menuPlanService: MenuplanService,
    private shoppingListService: ShoppingListService,
  ) {}

  ngOnInit(): void {
    this.menuPlanService.getMenuPlans().subscribe((menuPlans) => {
      this.menuPlans = menuPlans;
      this.rows = menuPlans;
    });
  }

  getIngredients(menuPlan: MenuplanType): Ingredient[] {
    const ingreadients: Ingredient[] = [];

    menuPlan.recipes.map((recipe) => {
      return recipe.ingredients.map((ingredient: Ingredient) => {
        ingreadients.push(ingredient);
      });
    });

    return ingreadients;
  }

  show() {

    const consolidatedData: { [key: string]: Ingredient } = {};
    const ingredients: Ingredient[] = [];

    this.selectedMenuPlans.forEach((menuPlan) => {
      menuPlan.recipes.forEach((recipe) => {
        recipe.ingredients.forEach((item: Ingredient) => {
          const key = `${item.name}-${item.unit}`;
          if (!consolidatedData[key]) {
            consolidatedData[key] = {
              ...item,
              amount: parseFloat(item.amount).toString(),
            };
          } else {
            consolidatedData[key].amount = (
              parseFloat(consolidatedData[key].amount) + parseFloat(item.amount)
            ).toString();
          }
        });
      });
    });

    const consolidatedIngredients = Object.values(consolidatedData);

    this.shoppingListService
      .createShoppingList(consolidatedIngredients)
      .subscribe((res) => {
      });
  }
}
