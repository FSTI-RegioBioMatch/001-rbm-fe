import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Meals,
  MealTheMealDbType,
} from '../../community-recipes/types/meal-the-meal-db.type';
import { environment } from '../../../environments/environment.development';
import { MealdbAreaType } from '../types/mealdb-area.type';
import { MealdbCategoryType } from '../types/mealdb-category.type';
import { MealdbIngredientType } from '../types/mealdb-ingredient.type';

@Injectable({
  providedIn: 'root',
})
export class TheMealDbService {
  constructor(private http: HttpClient) {}

  getIngredients() {
    return this.http.get<MealdbIngredientType>(
      `https://www.themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/list.php?i=list`,
    );
  }

  getMealsByIngredient(ingredient: string[]) {
    return this.http.get(
      `https://www.themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/filter.php?i=${ingredient.join(',')}`,
    );
  }

  getMealById(id: string) {
    return this.http.get<Meals>(
      `https://www.themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/lookup.php?i=${id}`,
    );
  }

  getAreas() {
    return this.http.get<MealdbAreaType>(
      `https://themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/list.php?a=list`,
    );
  }

  getCategories() {
    return this.http.get<MealdbCategoryType>(
      `https://themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/list.php?c=list`,
    );
  }

  getMealsByCategory(category: string[]) {
    return this.http.get(
      `https://www.themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/filter.php?c=${category.join(',')}`,
    );
  }

  getRandomMeal() {
    return this.http.get<Meals>(
      `https://www.themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/random.php`,
    );
  }

  get10RandomMeals() {
    return this.http.get<Meals>(
      `https://www.themealdb.com/api/json/v2/${environment.THE_MEAL_DB_KEY}/randomselection.php`,
    );
  }
}
