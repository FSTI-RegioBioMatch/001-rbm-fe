import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlannerDTO } from '../../dashboard2/components/card-suggestion/types/planner.type';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PlannerService {
  constructor(private http: HttpClient) {}

  startPlanning(bearerToken: string, plannerDTO: PlannerDTO) {
    const httpOptions = {
      headers: new HttpHeaders({
        'nearbuy-token': bearerToken,
      }),
    };
    return this.http.post(
      `${environment.API_PLANNER}/solver/solve`,
      plannerDTO,
      httpOptions,
    );
  }
}
