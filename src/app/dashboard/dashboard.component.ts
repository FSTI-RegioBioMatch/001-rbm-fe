import { Component, OnInit } from '@angular/core';
import { TheMealDbService } from '../shared/services/the-meal-db.service';
import { MealTheMealDbType } from '../community-recipes/types/meal-the-meal-db.type';
import { map } from 'rxjs';
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

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

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
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

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
