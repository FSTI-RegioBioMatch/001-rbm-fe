import { Component, OnInit } from '@angular/core';
import { RbmInputComponent } from '../../shared/components/ui/rbm-input/rbm-input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RbmSelectComponent } from '../../shared/components/ui/rbm-select/rbm-select.component';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [RbmInputComponent, ReactiveFormsModule, RbmSelectComponent],
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

  constructor() {
    this.form = new FormGroup<any>({
      myCompany: new FormControl('', Validators.required),
      marketName: new FormControl('', Validators.required),
      slogan: new FormControl(''),
      proof: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    console.log(this.form);
  }

  getForm() {
    console.log(this.form);
  }
}
