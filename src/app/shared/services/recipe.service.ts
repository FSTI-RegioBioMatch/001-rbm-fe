import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeType } from '../types/recipe.type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(private http: HttpClient) {}

  getRecipesByCompanyContext() {
    return this.http.get<RecipeType[]>(`${environment.API_CORE}/recipes`);
  }
  saveRecipe(recipe: any) {
    return this.http.post<any>(`${environment.API_CORE}/new-recipes`, recipe); //WIP NEW RECIPE MODEL
  }
}
