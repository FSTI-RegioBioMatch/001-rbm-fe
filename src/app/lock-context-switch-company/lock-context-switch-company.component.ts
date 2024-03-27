import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../shared/services/company.service';
import { CompanyType } from '../shared/types/company.type';
import { MatCard, MatCardContent } from '@angular/material/card';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-lock-context-switch-company',
  standalone: true,
  imports: [MatCard, MatCardContent],
  templateUrl: './lock-context-switch-company.component.html',
  styleUrl: './lock-context-switch-company.component.scss',
})
export class LockContextSwitchCompanyComponent implements OnInit {
  companies: CompanyType[] = [];

  constructor(
    private companyService: CompanyService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const company = sessionStorage.getItem('company');
    if (company) {
      this.router.navigate(['/']);
    }
    this.companyService.getCompaniesByUserId().subscribe((companies) => {
      console.log(companies);
      this.companies = companies;
    });
  }

  onClickSelectThisCompany(company: CompanyType) {
    sessionStorage.setItem('company', <string>company.id);
    this.router.navigate(['/']).then(() => {
      this.userService.init();
    });
  }
}
