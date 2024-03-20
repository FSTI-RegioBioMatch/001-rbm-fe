import { Component, OnInit } from '@angular/core';
import { MealTheMealDbType } from '../community-recipes/types/meal-the-meal-db.type';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import {
  MatCard,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { RecipeCardComponent } from '../my-recipes/components/recipe-card/recipe-card.component';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MessageComponent } from './components/message/message.component';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';
import { HttpClient } from '@angular/common/http';
import { TheMealDbService } from '../shared/services/the-meal-db.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  providers: [TheMealDbService],
  imports: [
    MatTabGroup,
    MatTab,
    MatCard,
    MatCardContent,
    RecipeCardComponent,
    MatButton,
    MatProgressSpinner,
    MatCardTitle,
    MatCardHeader,
    MatCardSubtitle,
    MatCardImage,
    MatCardAvatar,
    MessageComponent,
    MatIcon,
    MatTabLabel,
    MatBadge,
  ],
})
export class DashboardComponent implements OnInit {
  trendingMeals: MealTheMealDbType[] = [];
  myRecipesMeals: MealTheMealDbType[] = [];

  loadingRecipes = true;

  constructor(
    private mealDbService: TheMealDbService,
    private http: HttpClient,
  ) {}

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
