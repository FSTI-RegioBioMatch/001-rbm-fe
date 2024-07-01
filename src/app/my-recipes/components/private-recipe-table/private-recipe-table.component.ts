import { Component, OnInit } from '@angular/core';

import { RecipeService } from '../../../shared/services/recipe.service';
import { RecipeType } from '../../../shared/types/recipe.type';
import { Router } from '@angular/router';
import { StoreService } from '../../../shared/store/store.service';

@Component({
  selector: 'app-private-recipe-table',
  standalone: true,
  imports: [],
  templateUrl: './private-recipe-table.component.html',
  styleUrl: './private-recipe-table.component.scss',
})
export class PrivateRecipeTableComponent implements OnInit {
  rows: RecipeType[] = [];
  temp: RecipeType[] = [];
  selected: RecipeType[] = [];

  recipes: RecipeType[] = [];

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private store: StoreService,
  ) {}

  ngOnInit(): void {
    this.getRecipesByCompanyContext();
  }

  private getRecipesByCompanyContext() {
    this.recipeService.getRecipesByCompanyContext().subscribe((recipes) => {
      console.log(recipes);
      this.recipes = recipes;
      this.rows = recipes;
      this.temp = [...recipes];
    });
  }

  onRowSelected({ selected }: any) {
    console.log(selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event: any) {
    console.log('Activate Event', event);
  }

  onClickCreateMenuPlan() {
    console.log('Create Menu Plan');
    this.store.selectedRecipesSubject.next(this.selected);
    this.router.navigate(['/menu-planning']);
  }
}
