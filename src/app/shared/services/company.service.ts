import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompanyType } from '../types/company.type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http: HttpClient) {}
}
