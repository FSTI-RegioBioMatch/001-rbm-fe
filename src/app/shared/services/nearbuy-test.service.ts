import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NearbuyTestService {

  private apiUrl = 'https://api.staging.nearbuy-food.de/v1/ontofood'; // Your main API
  private localizeUrl = 'https://api.locize.app/ad439f20-6ec0-41f8-af94-ebd3cf1b9b90/latest/de/ontofood'; // Localize API

  constructor(private http: HttpClient) { }

  /**
   * Fetch and combine ingredient data with localization data
   * @returns Observable<any[]>
   */
  getData(): Observable<any[]> {
    const mainData$ = this.http.get<any[]>(this.apiUrl).pipe(catchError(this.handleError));
    const localizeData$ = this.http.get<any>(this.localizeUrl).pipe(catchError(this.handleError));

    return forkJoin([mainData$, localizeData$]).pipe(
      map(([mainData, localizeData]) => {
        return this.mapAndCombineData(mainData, localizeData);
      })
    );
  }

  /**
   * Map and combine the main data with localization data
   * @param mainData any[]
   * @param localizeData any
   * @returns any[]
   */
  private mapAndCombineData(mainData: any[], localizeData: any): any[] {
    const combinedData: any[] = [];

    // First, add all localized items if they match with main data
    mainData.forEach(item => {
      const localizedValue = localizeData[item.label]; // Find localized value by matching the main data label

      if (localizedValue) {
        // If there's a match, add the localized version
        combinedData.push({
          displayLabel: localizedValue, // Display the localized value
          value: item.label // Save the original key for DB
        });
      } else {
        // If no match, use the main data's label
        combinedData.push({
          displayLabel: item.label, // Display the original label
          value: item.label // Save the original label as well
        });
      }
    });

    return combinedData;
  }

  /**
   * Error handling for HTTP requests
   * @param error HttpErrorResponse
   * @returns Observable<never>
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
    }

    console.error(errorMessage); // Log error to console

    return throwError('Something went wrong; please try again later.');
  }
}
