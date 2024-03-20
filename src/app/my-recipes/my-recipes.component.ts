import { Component, OnInit } from '@angular/core';
import { RecipeSearchToolbarComponent } from './components/recipe-search-toolbar/recipe-search-toolbar.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { Card } from './types/card';
import { MatDialog } from '@angular/material/dialog';
import { RecipeInformationDialogComponent } from './components/recipe-infomation-dialog/recipe-information-dialog.component';
import {
  Meals,
  MealTheMealDbType,
} from '../community-recipes/types/meal-the-meal-db.type';
import { TheMealDbService } from '../shared/services/the-meal-db.service';

@Component({
  selector: 'app-my-recipes',
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
  standalone: true,
  imports: [RecipeSearchToolbarComponent, RecipeCardComponent],
  providers: [],
})
export class MyRecipesComponent implements OnInit {
  meals!: Meals;

  constructor(
    public dialog: MatDialog,
    private mealDbService: TheMealDbService,
  ) {}

  openRecipeDialog(meal: MealTheMealDbType) {
    const dialogRef = this.dialog.open(RecipeInformationDialogComponent, {
      width: '1300px',
      height: 'auto',
      data: {
        meal: meal,
        isCanFork: true,
      },
    });
  }

  ngOnInit(): void {
    this.mealDbService.get10RandomMeals().subscribe((meals) => {
      this.meals = meals;
    });
  }
}
