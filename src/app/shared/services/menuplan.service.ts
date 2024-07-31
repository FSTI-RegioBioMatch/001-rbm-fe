import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuplanType } from '../types/menuplan.type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuplanService {
  constructor(private http: HttpClient) {}

  createMenuPlan(menuPlan: MenuplanType) {
    return this.http.post<MenuplanType>(`${environment.API_CORE}/menuplan`, {
    });
  }

  getMenuPlans() {
    return this.http.get<MenuplanType[]>(`${environment.API_CORE}/menuplan`);
  }
}
