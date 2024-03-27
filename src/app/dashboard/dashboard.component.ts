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
import { CompanyService } from '../shared/services/company.service';
import { CompanyType } from '../shared/types/company.type';

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

  company!: CompanyType;

  constructor(
    private mealDbService: TheMealDbService,
    private http: HttpClient,
    private companyService: CompanyService,
  ) {}

  ngOnInit(): void {
    this.get3RandomMeals();

    const companyId = sessionStorage.getItem('company');
    if (companyId) {
      this.companyService.getCompanyById(companyId).subscribe((company) => {
        this.company = company;
      });
    }
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
