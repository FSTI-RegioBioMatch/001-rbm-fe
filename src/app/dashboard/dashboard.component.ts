import { Component, OnInit } from '@angular/core';
import { TheMealDbService } from '../shared/services/the-meal-db.service';
import { MealTheMealDbType } from '../community-recipes/types/meal-the-meal-db.type';
import { map } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  trendingMeals: MealTheMealDbType[] = [];
  myRecipesMeals: MealTheMealDbType[] = [];

  loadingRecipes = true;

  constructor(private mealDbService: TheMealDbService) {}

  ngOnInit(): void {
    this.get3RandomMeals();
  }

  get3RandomMeals() {
    this.mealDbService.get10RandomMeals().subscribe((data) => {
      data.meals.map((meal, index) => {
        if (index < 4) {
          this.trendingMeals.push(meal);
        }
        if (index > 4 && index < 9) {
          this.myRecipesMeals.push(meal);
        }
      });

      this.loadingRecipes = false;
    });
  }
}
