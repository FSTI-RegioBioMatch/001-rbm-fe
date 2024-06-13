import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { RbmSelectComponent } from '../ui/rbm-select/rbm-select.component';
import { CompanyType } from '../../types/company.type';
import { StoreService } from '../../store/store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-company-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatInput,
    FormsModule,
    MatFormField,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatLabel,
    RbmSelectComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './change-company-dialog.component.html',
  styleUrl: './change-company-dialog.component.scss',
})
export class ChangeCompanyDialogComponent implements OnInit {
  companies: CompanyType[] = [];
  companyValues: { value: string; viewValue: string }[] = [];
  form: FormGroup;

  get company() {
    return this.form.get('company') as FormControl;
  }

  constructor(
    public dialogRef: MatDialogRef<ChangeCompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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

    this.company.valueChanges.subscribe((value) => {
      console.log('value', value);
      const company = this.companies.find((company) => company.id === value);
      if (company) {
        console.log(123123123);
        this.store.updateSelectedCompanyContext(company);
        window.location.reload();
      }
    });
  }

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
}
