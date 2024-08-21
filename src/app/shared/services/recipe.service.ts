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

        return this.http.get<Page<RecipeType>>(`${environment.API_CORE}/new-recipes`, {
          params,
          headers: { 'Current-Company': company.id },
        });
      }),
      catchError(error => {
        console.error('Error fetching recipes by company ID:', error);
        return throwError(error);
      })
    );
  }

  getRecipesByCompanyContext(): Observable<RecipeType[]> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        return this.http.get<RecipeType[]>(`${environment.API_CORE}/recipes`, {
          headers: { 'Current-Company': company.id },
        });
      }),
      catchError(error => {
        console.error('Error fetching recipes by company context:', error);
        return throwError(error);
      })
    );
  }

  saveRecipe(recipe: any): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        recipe.companyId = company.id;
        return this.http.post<any>(`${environment.API_CORE}/new-recipes`, recipe, {
          headers: { 'Current-Company': company.id },
        });
      }),
      catchError(error => {
        console.error('Error saving recipe:', error);
        return throwError(error);
      })
    );
  }

  getRecipeById(id: string): Observable<RecipeType> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        return this.http.get<RecipeType>(`${environment.API_CORE}/new-recipes/${id}`, {
          headers: { 'Current-Company': company.id },
        });
      }),
      catchError(error => {
        console.error('Error fetching recipe by ID:', error);
        return throwError(error);
      })
    );
  }

  updateRecipeById(id: string, recipe: Partial<RecipeType>): Observable<RecipeType> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        recipe.companyId = company.id;
        return this.http.put<RecipeType>(`${environment.API_CORE}/new-recipes/${id}`, recipe, {
          headers: { 'Current-Company': company.id },
        });
      }),
      catchError(error => {
        console.error('Error updating recipe:', error);
        return throwError(error);
      })
    );
  }

  deleteRecipeById(id: string): Observable<void> {
    if (!id) {
      return throwError('Recipe ID is required to delete a recipe');
    }
  
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        const url = `${environment.API_CORE}/new-recipes/${id}`;
        return this.http.delete<void>(url, {
          headers: { 'Current-Company': company.id },
        });
      }),
      catchError(error => {
        console.error('Error deleting recipe:', error);
        return throwError(error);
      })
    );
  }
  
}

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
