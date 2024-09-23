import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalizeService {

    private baseUrl: string = 'https://api.locize.app/ad439f20-6ec0-41f8-af94-ebd3cf1b9b90/latest/de/';

    constructor(private http: HttpClient) {}
  
    // Specific method to get data for levels of processing
    getLevelsOfProcessing(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}levelsOfProcessing`);
    }
  
    // Specific method to get data for additives usage
    getAdditivesUsage(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}additivesUsage`);
    }
  
    // Specific method to get data for allergens
    getAllergens(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}allergens`);
    }
  
    // Specific method to get data for container types
    getContainerType(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}containertype`);
    }
  
    // Specific method to get data for cultivation
    getCultivation(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}cultivation`);
    }
  
    // Specific method to get data for eNumbers
    getENumbers(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}eNumbers`);
    }
  
    // Specific method to get data for grade
    getGrade(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}grade`);
    }
  
    // Specific method to get data for husbandry
    getHusbandry(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}husbandry`);
    }
  
    // Specific method to get data for ontofood
    getOntofood(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}ontofood`);
    }
  
    // Specific method to get data for short units
    getShortUnits(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}shortunits`);
    }
  
    // Specific method to get data for units
    getUnits(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}units`);
    }
}
