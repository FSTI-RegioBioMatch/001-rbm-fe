import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompanyType } from '../types/company.type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http: HttpClient) {}

  public createCompany(company: CompanyType) {
    this.http.post(`${environment.MASTERDATA}/company`, company).subscribe();
  }

  public getCompaniesByUserId() {
    return this.http.get<CompanyType[]>(
      `${environment.MASTERDATA}/company/getUserCompanies`,
    );
  }

  public getCompanyById(companyId: string) {
    return this.http.get<CompanyType>(
      `${environment.MASTERDATA}/company/${companyId}`,
    );
  }
}
