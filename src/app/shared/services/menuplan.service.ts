import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MenuplanType } from '../types/menuplan.type';

@Injectable({
  providedIn: 'root',
})
export class MenuplanService {
  constructor(private http: HttpClient) {}

  createMenuPlan(menuPlan: MenuplanType) {
    return this.http.post<MenuplanType>(
      `http://localhost:8082/api/v1/menuplan`,
      {
        menuName: menuPlan.menuName,
        description: menuPlan.description,
        weekDay: menuPlan.weekDay,
        executionWeekNumber: menuPlan.executionWeekNumber,
        place: menuPlan.place,
        portions: menuPlan.portions,
        recipes: menuPlan.recipes,
      },
    );
  }

  getMenuPlans() {
    return this.http.get<MenuplanType[]>(
      `http://localhost:8082/api/v1/menuplan`,
    );
  }
}
