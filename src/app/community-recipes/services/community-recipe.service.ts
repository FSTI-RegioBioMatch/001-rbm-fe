import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommunityRecipePagingType } from '../types/community-recipe-paging.type';

@Injectable({
  providedIn: 'root',
})
export class CommunityRecipeService {
  constructor(private http: HttpClient) {}

  getCommunityRecipes() {
    return this.http.get<CommunityRecipePagingType>(
      'http://localhost:8085/api/v1/recipe',
    );
  }
}
