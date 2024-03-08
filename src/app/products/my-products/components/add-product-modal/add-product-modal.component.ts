import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatFormFieldModule,
  MatHint,
  MatLabel,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-product-modal',
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.scss',
  standalone: true,
  imports: [
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatLabel,
    MatDivider,
    MatDateRangeInput,
    MatDatepickerToggle,
    MatDateRangePicker,
    MatHint,
    MatStartDate,
    MatEndDate,
    MatIcon,
    MatFormFieldModule,
    MatDatepickerModule,
    MatCheckbox,
  ],
  providers: [provideNativeDateAdapter()],
})
export class AddProductModalComponent {
  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('Heinz Farmer', Validators.required),
      email: new FormControl('', Validators.required),
      productName: new FormControl('', Validators.required),
      productDescription: new FormControl(''),
    });
  }
}
