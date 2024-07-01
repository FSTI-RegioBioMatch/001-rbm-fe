import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeType } from '../types/recipe.type';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(private http: HttpClient) {}

  getRecipesByCompanyContext() {
    return this.http.get<RecipeType[]>(`http://localhost:8082/api/v1/recipes`);
  }
}
