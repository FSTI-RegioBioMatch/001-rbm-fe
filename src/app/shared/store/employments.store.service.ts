import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmploymentType } from '../types/employment.type';

@Injectable({
  providedIn: 'root',
})
export class EmploymentsStoreService {
  // Employments
  public employmentsSubject = new BehaviorSubject<EmploymentType[]>([]);
  public employments$ = this.employmentsSubject.asObservable();
}
