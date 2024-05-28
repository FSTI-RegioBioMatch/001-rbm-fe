import { Component, OnInit } from '@angular/core';
import { RbmInputComponent } from '../../shared/components/ui/rbm-input/rbm-input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RbmSelectComponent } from '../../shared/components/ui/rbm-select/rbm-select.component';
import { RbmCheckboxComponent } from '../../shared/components/ui/rbm-checkbox/rbm-checkbox.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { CompanyMemberComponent } from './components/company-member/company-member.component';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    RbmInputComponent,
    ReactiveFormsModule,
    RbmSelectComponent,
    RbmCheckboxComponent,
    MatCheckbox,
    CompanyMemberComponent,
    MatButton,
    MatDivider,
  ],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.scss',
})
export class CompanySettingsComponent implements OnInit {
  form: FormGroup;

  proofData = [
    { value: '1', viewValue: 'Registernummer' },
    { value: '3', viewValue: 'Gewerbeschein' },
    { value: '2', viewValue: 'Ökokontrollnummer' },
  ];

  get myCompany() {
    return this.form.get('myCompany') as FormControl;
  }

  get marketName() {
    return this.form.get('marketName') as FormControl;
  }

  get slogan() {
    return this.form.get('slogan') as FormControl;
  }

  get proof() {
    return this.form.get('proof') as FormControl;
  }

  get proofNumber() {
    return this.form.get('proofNumber') as FormControl;
  }

  get telephone() {
    return this.form.get('telephone') as FormControl;
  }

  get mobilePhone() {
    return this.form.get('mobilePhone') as FormControl;
  }

  get fax() {
    return this.form.get('fax') as FormControl;
  }

  get companyEmail() {
    return this.form.get('companyEmail') as FormControl;
  }

  get website() {
    return this.form.get('website') as FormControl;
  }

  get streetAndHouseNumber() {
    return this.form.get('streetAndHouseNumber') as FormControl;
  }

  get companyAdditionalInformation() {
    return this.form.get('companyAdditionalInformation') as FormControl;
  }

  get zipCode() {
    return this.form.get('zipCode') as FormControl;
  }

  get city() {
    return this.form.get('city') as FormControl;
  }

  get differentBillingAddress() {
    return this.form.get('differentBillingAddress') as FormControl;
  }

  get differentDeliveryAddress() {
    return this.form.get('differentDeliveryAddress') as FormControl;
  }

  constructor() {
    this.form = new FormGroup<any>({
      myCompany: new FormControl('', Validators.required),
      marketName: new FormControl('', Validators.required),
      slogan: new FormControl(''),
      proof: new FormControl('', Validators.required),
      proofNumber: new FormControl(''),
      telephone: new FormControl('', Validators.required),
      mobilePhone: new FormControl(''),
      fax: new FormControl(''),
      companyEmail: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      website: new FormControl(''),
      streetAndHouseNumber: new FormControl('', Validators.required),
      companyAdditionalInformation: new FormControl(''),
      zipCode: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      differentBillingAddress: new FormControl(false),
      differentDeliveryAddress: new FormControl(false),
      differentBillingOrDeliveryAddressForm: new FormGroup<any>({
        differentStreetAndHouseNumber: new FormControl(''),
        differentZipCode: new FormControl(''),
        differentCity: new FormControl(''),
      }),
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }
}
