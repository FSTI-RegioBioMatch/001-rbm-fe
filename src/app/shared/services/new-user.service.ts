import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NewUserService {

  private apiUrl = environment.NEARBUY_API;


  constructor(
    private http: HttpClient
  ) { }

    getMe(): Observable<any> {
      return this.http.get(`${this.apiUrl}/persons/me`);
    }
    getEmployments(userId: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/persons/${userId}/employments`);
    }
    getCompany(companyId: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/companies/${companyId}`);
    }
    getAddress(addressId: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/addresses/${addressId}`);
    }
}
