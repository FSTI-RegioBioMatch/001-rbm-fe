import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CompanyType } from '../../../../../../shared/types/company.type';
import { CompanyService } from '../../../../../../shared/services/company.service';

@Component({
  selector: 'app-create-company-modal',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
  ],
  templateUrl: './create-company-modal.component.html',
  styleUrl: './create-company-modal.component.scss',
})
export class CreateCompanyModalComponent {
  form: FormGroup;

  constructor(private companyService: CompanyService) {
    this.form = new FormGroup<any>({
      marketName: new FormControl('', Validators.required),
      companyName: new FormControl('', Validators.required),
      slogan: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      contactEmail: new FormControl('', Validators.required),
      faxNumber: new FormControl('', Validators.required),
      website: new FormControl('', Validators.required),
      ecoControlNumber: new FormControl('', Validators.required),
      registerNumber: new FormControl('', Validators.required),
      taxNumber: new FormControl('', Validators.required),
      companyStreet: new FormControl('', Validators.required),
      companyCity: new FormControl('', Validators.required),
      companyZip: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    console.log(this.form.value);
    const company: CompanyType = {
      marketName: this.form.value.marketName,
      companyName: this.form.value.companyName,
      slogan: this.form.value.slogan,
      phone: this.form.value.phone,
      contactEmail: this.form.value.contactEmail,
      faxNumber: this.form.value.faxNumber,
      website: this.form.value.website,
      ecoControlNumber: this.form.value.ecoControlNumber,
      registerNumber: this.form.value.registerNumber,
      taxNumber: this.form.value.taxNumber,
      companyStreet: this.form.value.companyStreet,
      companyCity: this.form.value.companyCity,
      companyZip: this.form.value.companyZip,
    };

    console.log(this.form);

    if (this.form.invalid) {
      return;
    }

    this.companyService.createCompany(company);
  }
}
