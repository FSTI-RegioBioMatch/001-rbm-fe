import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CompanyType } from '../types/company.type';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http: HttpClient) {}

  public createCompany(company: CompanyType) {
    this.http.post('/services/masterdata/api/company', company).subscribe();
  }

  public getCompaniesByUserId() {
    return this.http.get<CompanyType[]>(
      `/services/masterdata/api/company/getUserCompanies`,
    );
  }

  public getCompanyById(companyId: string) {
    return this.http.get<CompanyType>(
      `/services/masterdata/api/company/${companyId}`,
    );
  }
}
