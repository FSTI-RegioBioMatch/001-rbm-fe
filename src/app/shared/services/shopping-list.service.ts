import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ingredient } from '../types/recipe.type';
import { environment } from '../../../environments/environment';
import { ShoppingListType } from '../types/shopping-list.type';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  constructor(private http: HttpClient) {}

  createShoppingList(ingredients: Ingredient[]) {
    return this.http.post(`${environment.API_CORE}/shopping-list`, {
      ingredients: ingredients,
    });
  }

  getShoppingListByCompanyId() {
    return this.http.get<ShoppingListType[]>(
      `${environment.API_CORE}/shopping-list`,
    );
  }

  getShoppingListByCompanyIdAndId(id: string) {
    return this.http.get<ShoppingListType>(
      `${environment.API_CORE}/shopping-list/${id}`,
    );
  }
}
