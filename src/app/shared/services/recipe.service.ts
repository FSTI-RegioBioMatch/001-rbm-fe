import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RecipeType } from '../types/recipe.type';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
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
  getRecipesByCompanyId(
    page: number,
    size: number,
    sort: string,
    searchName?: string,
    saisons?: string[]
  ): Observable<Page<RecipeType>> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
  
        let params = new HttpParams()
          .set('companyId', company.id)
          .set('page', page.toString())
          .set('size', size.toString())
          .set('sort', sort);
  
        if (searchName) {
          params = params.set('name', searchName);
        }
  
        if (saisons && saisons.length > 0) {
          params = params.set('saisons', saisons.join(','));
        }
  
        return this.http.get<Page<RecipeType>>(`${environment.API_CORE}/new-recipes`, { params });
      }),
      catchError(error => {
        console.error('Error fetching recipes by company ID:', error);
        return throwError(error);
      })
    );
  }
  

  getRecipesByCompanyContext() {
    return this.http.get<RecipeType[]>(`${environment.API_CORE}/recipes`);
  }

  /**
   * Saves a new recipe with the currently selected company ID.
   * 
   * @param recipe - The recipe data to be saved.
   * @returns An Observable of the saved recipe.
   * 
   * Example usage:
   * 
   * this.recipeService.saveRecipe(recipe)
   *   .subscribe(savedRecipe => {
   *     console.log('Saved Recipe:', savedRecipe);
   *   });
   */
  saveRecipe(recipe: any): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        recipe.companyId = company.id;
        return this.http.post<any>(`${environment.API_CORE}/new-recipes`, recipe);
      }),
      catchError(error => {
        console.error('Error saving recipe:', error);
        return throwError(error);
      })
    );
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
