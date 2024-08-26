import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { StoreService } from '../store/store.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NewShoppingListService {
  private apiUrl = `${environment.API_CORE}/shoppinglists`;

  constructor(private http: HttpClient, private storeService: StoreService) {}

  /**
   * Saves a new shopping list with the currently selected company ID.
   * 
   * @param shoppingList - The shopping list data to be saved.
   * @returns An Observable of the saved shopping list.
   */
  saveShoppingList(shoppingList: any): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        shoppingList.companyId = company.id;
        return this.http.post<any>(`${this.apiUrl}`, shoppingList);
      }),
      catchError(error => {
        console.error('Error saving shopping list:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Retrieves a shopping list by ID with the currently selected company ID.
   * 
   * @param shoppingListId - The ID of the shopping list to retrieve.
   * @returns An Observable of the shopping list.
   */
  getShoppingListById(shoppingListId: string): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        const params = new HttpParams().set('companyId', company.id);
        return this.http.get<any>(`${this.apiUrl}/${shoppingListId}`, { params });
      }),
      catchError(error => {
        console.error('Error fetching shopping list by ID:', error);
        return throwError(error);
      })
    );
  }
  

  /**
   * Retrieves all shopping lists with the currently selected company ID.
   * 
   * @returns An Observable of an array of shopping lists.
   */
  getAllShoppingLists(): Observable<any[]> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        let params = new HttpParams().set('companyId', company.id);
        return this.http.get<any[]>(`${this.apiUrl}`, { params });
      }),
      catchError(error => {
        console.error('Error fetching all shopping lists:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Deletes a shopping list by ID with the currently selected company ID.
   * 
   * @param shoppingListId - The ID of the shopping list to delete.
   * @returns An Observable of void.
   */
  deleteShoppingList(shoppingListId: string): Observable<void> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        let params = new HttpParams().set('companyId', company.id);
        return this.http.delete<void>(`${this.apiUrl}/${shoppingListId}`, { params });
      }),
      catchError(error => {
        console.error('Error deleting shopping list:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Updates a shopping list by ID with the currently selected company ID.
   * 
   * @param shoppingListId - The ID of the shopping list to update.
   * @param updatedShoppingList - The updated shopping list data.
   * @returns An Observable of the updated shopping list.
   */
  updateShoppingList(shoppingListId: string, updatedShoppingList: any): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        updatedShoppingList.companyId = company.id;
        return this.http.put<any>(`${this.apiUrl}/${shoppingListId}`, updatedShoppingList);
      }),
      catchError(error => {
        console.error('Error updating shopping list:', error);
        return throwError(error);
      })
    );
  }
}
