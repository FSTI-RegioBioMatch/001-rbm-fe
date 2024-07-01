import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CompanyType } from '../../types/company.type';
import { StoreService } from '../../store/store.service';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-change-company-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DropdownModule],
  templateUrl: './change-company-dialog.component.html',
  styleUrl: './change-company-dialog.component.scss',
})
export class ChangeCompanyDialogComponent implements OnInit {
  companies: CompanyType[] = [];
  companyValues: { value: string; viewValue: string }[] = [];
  selectedValue!: CompanyType;
  form: FormGroup;

  get company() {
    return this.form.get('company') as FormControl;
  }

  constructor(
    private store: StoreService,
    private router: Router,
  ) {
    this.form = new FormGroup({
      company: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.store.companies$.subscribe((companies) => {
      companies.map((company) => {
        this.companyValues.push({
          value: company.id as string,
          viewValue: company.name as string,
        });
      });

      this.companies = companies;
    });

    this.company.valueChanges.subscribe((value: any) => {
      const company = this.companies.find(
        (company) => company.id === value.value,
      );
      console.log('company', company);
      if (company) {
        this.store.updateSelectedCompanyContext(company);
        window.location.reload();
      }
    });
  }
}
