import { Component, OnInit } from '@angular/core';
import { TheMealDbService } from '../shared/services/the-meal-db.service';
import moment from 'moment';
import {
  Ingredient,
  MealdbIngredientType,
} from '../shared/types/mealdb-ingredient.type';

interface SeasonCalendarData {
  name: string;
  sowMonths: number[];
  harvestMonths: number[];
  plantMonths: number[];
}

@Component({
  selector: 'app-season-calendar',
  templateUrl: './season-calendar.component.html',
  styleUrl: './season-calendar.component.scss',
  standalone: true,
  imports: [],
})
export class SeasonCalendarComponent implements OnInit {
  monthsOfYear: string[] = [];
  monthsNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  ingredients: Ingredient[] = [];
  loading = true;

  seasonCalendarData: SeasonCalendarData[] = [
    {
      name: 'Tomato',
      sowMonths: [1, 2, 3, 4],
      harvestMonths: [6, 7, 8],
      plantMonths: [3, 4, 5],
    },
    {
      name: 'Potato',
      sowMonths: [3, 4, 5],
      harvestMonths: [7, 8, 9],
      plantMonths: [4, 5, 6],
    },
    {
      name: 'Carrot',
      sowMonths: [3, 4, 5],
      harvestMonths: [7, 8, 9],
      plantMonths: [4, 5, 6],
    },
    {
      name: 'Cucumber',
      sowMonths: [4, 5, 6],
      harvestMonths: [7, 8, 9],
      plantMonths: [5, 6, 7],
    },
    {
      name: 'Onion',
      sowMonths: [3, 4, 5],
      harvestMonths: [7, 8, 9],
      plantMonths: [4, 5, 6],
    },
  ];

  constructor(private mealDbService: TheMealDbService) {}
  ngOnInit(): void {
    this.getIngredients();
    this.getYearMonths();
  }

  private getYearMonths() {
    // It is possible to set the locale for moment.js
    moment.locale('en');
    this.monthsOfYear = moment.months();
  }

  private getIngredients() {
    this.mealDbService.getIngredients().subscribe((data) => {
      console.log(data);
      this.ingredients = data.meals;
      this.loading = false;
    });
  }

  public imageFinder(ingredient: string) {
    if (this.loading) {
      return 'https://via.placeholder.com/150';
    }

    const val = this.ingredients.find(
      (ingredientToFind) => ingredientToFind.strIngredient === ingredient,
    )?.strIngredient;

    if (val) {
      return `https://www.themealdb.com/images/ingredients/${val}.png`;
    } else {
      return 'https://via.placeholder.com/150';
    }
  }
}
