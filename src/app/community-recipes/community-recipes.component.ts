import { Component, OnInit } from '@angular/core';
import { CommunityRecipeService } from './services/community-recipe.service';
import { HttpClientModule } from '@angular/common/http';
import { CommunityRecipePagingType } from './types/community-recipe-paging.type';
import { RecipeCardComponent } from '../my-recipes/components/recipe-card/recipe-card.component';
import { RecipeSearchToolbarComponent } from '../my-recipes/components/recipe-search-toolbar/recipe-search-toolbar.component';
import { TheMealDbService } from '../shared/services/the-meal-db.service';
import { Meals, MealTheMealDbType } from './types/meal-the-meal-db.type';
import { JsonPipe } from '@angular/common';
import { RecipeInformationDialogComponent } from '../my-recipes/components/recipe-infomation-dialog/recipe-information-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-community-recipes',
  templateUrl: './community-recipes.component.html',
  styleUrl: './community-recipes.component.scss',
  standalone: true,
  imports: [
    HttpClientModule,
    RecipeCardComponent,
    RecipeSearchToolbarComponent,
    JsonPipe,
  ],
  providers: [],
})
export class CommunityRecipesComponent implements OnInit {
  communityRecipes!: CommunityRecipePagingType;
  loading = true;
  meals!: Meals;

  constructor(
    private communityRecipeService: CommunityRecipeService,
    private mealDbService: TheMealDbService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // this.getCommunityRecipesByPage();
    this.getCommunityRecipes();
  }

  getCommunityRecipesByPage() {
    this.communityRecipeService.getCommunityRecipes().subscribe((data) => {
      console.log(data);
      this.communityRecipes = data;
      this.loading = false;
    });
  }

  getCommunityRecipes() {
    this.mealDbService.get10RandomMeals().subscribe((data) => {
      this.meals = data;
    });
  }

  openRecipeDialog(item: MealTheMealDbType) {
    const dialogRef = this.dialog.open(RecipeInformationDialogComponent, {
      width: '1300px',
      height: 'auto',
      data: {
        meal: item,
        isCanFork: true,
      },
    });
  }
}
