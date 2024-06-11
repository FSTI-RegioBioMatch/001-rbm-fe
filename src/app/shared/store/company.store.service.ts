import { Injectable } from '@angular/core';
import { UserStoreService } from './user.store.service';
import { BehaviorSubject } from 'rxjs';
import { CompanyType } from '../types/company.type';

@Injectable({
  providedIn: 'root',
})
export class CompanyStoreService {
  // Companies
  public companiesSubject = new BehaviorSubject<CompanyType[]>([]);
  public companies$ = this.companiesSubject.asObservable();

  // current user company context
  private selectedCompanyContext = new BehaviorSubject<CompanyType | null>(
    null,
  );
  public selectedCompanyContext$ = this.selectedCompanyContext.asObservable();

  constructor() {
    this.getSelectedCompanyFromSessionStore();
    this.selectedCompanyContextChangedListener();
  }

  private getSelectedCompanyFromSessionStore() {
    const companyContext = localStorage.getItem('company_context');
    if (companyContext) {
      console.info('Company context from session store:', companyContext);

      this.companies$.subscribe((companies) => {
        const company = companies.find((c) => c.id === companyContext);
        if (company) {
          this.selectedCompanyContext.next(company);
        }
      });
      // this.selectedCompanyContext.next(companyContext);
    } else {
      this.companies$.subscribe((companies) => {
        if (companies.length > 0) {
          this.selectedCompanyContext.next(companies[0]);
        }
      });
    }
  }

  private selectedCompanyContextChangedListener() {
    this.selectedCompanyContext$.subscribe((company) => {
      if (company) {
        // this.companiesSubject.next([company]);
        localStorage.setItem('company_context', company.id);
      }
    });
  }

  public updateSelectedCompanyContext(company: CompanyType) {
    console.info('Updating selected company context:', company);
    this.selectedCompanyContext.next(company);
  }
}
