import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RecipeType } from '../types/recipe.type';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StoreService } from '../store/store.service';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(private http: HttpClient, private storeService: StoreService) {}

  /**
   * Retrieves all recipes for the currently selected company ID with support for pagination and sorting.
   * 
   * @param page - The page number to retrieve (0-based index).
   * @param size - The number of recipes per page.
   * @param sort - The sorting criteria in the format 'property, direction' (e.g., 'recipeName,asc').
   * @returns An Observable containing a page of recipes.
   * 
   * Example usage:
   * 
   * this.recipeService.getRecipesByCompanyId(0, 10, 'recipeName,asc')
   *   .subscribe(page => {
   *     console.log('Recipes:', page.content);
   *     console.log('Total Elements:', page.totalElements);
   *   });
   */
  getRecipesByCompanyId(page: number, size: number, sort: string): Observable<Page<RecipeType>> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company) {
          throw new Error('No company selected');
        }
        let params = new HttpParams()
          .set('companyId', company.id)
          .set('page', page.toString())
          .set('size', size.toString())
          .set('sort', sort);

        return this.http.get<Page<RecipeType>>(`${environment.API_CORE}/new-recipes`, { params });
      })
    );
  }

  getRecipesByCompanyContext() {
    return this.http.get<RecipeType[]>(`${environment.API_CORE}/recipes`);
  }

  saveRecipe(recipe: any) {
    return this.http.post<any>(`${environment.API_CORE}/new-recipes`, recipe); // WIP NEW RECIPE MODEL
  }

  getRecipeById(id: string): Observable<RecipeType> {
    return this.http.get<RecipeType>(`${environment.API_CORE}/new-recipes/${id}`);
  }
}

/**
 * Interface representing a paginated response.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
