import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { StoreService } from '../store/store.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NewMenuplanService {
  private apiUrl = `${environment.API_CORE}/new-menu-plans`;

  constructor(private http: HttpClient, private storeService: StoreService) {}

  /**
   * Saves a new menu plan with the currently selected company ID.
   *
   * @param menuPlan - The menu plan data to be saved.
   * @returns An Observable of the saved menu plan.
   */
  saveMenuPlan(menuPlan: any): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        menuPlan.companyId = company.id;
        return this.http.post<any>(`${this.apiUrl}`, menuPlan);
      }),
      catchError(error => {
        console.error('Error saving menu plan:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Deletes a menu plan by ID with the currently selected company ID.
   *
   * @param menuPlanId - The ID of the menu plan to delete.
   * @returns An Observable of void.
   */
  deleteMenuPlan(menuPlanId: string): Observable<void> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        let params = new HttpParams().set('companyId', company.id);
        return this.http.delete<void>(`${this.apiUrl}/${menuPlanId}`, { params });
      }),
      catchError(error => {
        console.error('Error deleting menu plan:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Deletes an event from a menu plan by IDs with the currently selected company ID.
   *
   * @param menuPlanId - The ID of the menu plan.
   * @param eventId - The ID of the event to delete.
   * @returns An Observable of the response.
   */
  deleteEventFromMenuPlan(menuPlanId: string, eventId: string): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        let params = new HttpParams().set('companyId', company.id);
        return this.http.delete<any>(`${this.apiUrl}/${menuPlanId}/events/${eventId}`, { params });
      }),
      catchError(error => {
        console.error('Error deleting event from menu plan:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Retrieves a menu plan by ID with the currently selected company ID.
   *
   * @param menuPlanId - The ID of the menu plan to retrieve.
   * @returns An Observable of the menu plan.
   */
  getMenuPlanById(menuPlanId: string): Observable<any> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        let params = new HttpParams().set('companyId', company.id);
        return this.http.get<any>(`${this.apiUrl}/${menuPlanId}`, { params });
      }),
      catchError(error => {
        console.error('Error fetching menu plan by ID:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Retrieves all menu plans with the currently selected company ID.
   *
   * @returns An Observable of an array of menu plans.
   */
  getAllMenuPlans(): Observable<any[]> {
    return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
        if (!company || !company.id) {
          return throwError('No company selected or company ID is missing');
        }
        let params = new HttpParams().set('companyId', company.id);
        return this.http.get<any[]>(`${this.apiUrl}`, { params });
      }),
      catchError(error => {
        console.error('Error fetching all menu plans:', error);
        return throwError(error);
      })
    );
  }
  /**
 * Updates an event in a menu plan by IDs with the currently selected company ID.
 *
 * @param menuPlanId - The ID of the menu plan.
 * @param eventId - The ID of the event to update.
 * @param eventData - The updated event data.
 * @returns An Observable of the response.
 */
updateEventInMenuPlan(menuPlanId: string, eventId: string, eventData: any): Observable<any> {
  return this.storeService.selectedCompanyContext$.pipe(
      switchMap(company => {
          if (!company || !company.id) {
              return throwError('No company selected or company ID is missing');
          }
          let params = new HttpParams().set('companyId', company.id);
          return this.http.put<any>(`${this.apiUrl}/${menuPlanId}/events/${eventId}`, eventData, { params });
      }),
      catchError(error => {
          console.error('Error updating event in menu plan:', error);
          return throwError(error);
      })
  );
}

}
