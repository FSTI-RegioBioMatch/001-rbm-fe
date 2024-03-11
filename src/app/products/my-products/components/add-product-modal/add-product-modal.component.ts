import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatFormFieldControl,
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
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';

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
    MatButton,
    MatSelect,
    MatOption,
  ],
  providers: [provideNativeDateAdapter()],
})
export class AddProductModalComponent {
  form: FormGroup;

  possibleFinishing = [
    { id: 1, value: 'Trocknen' },
    { id: 2, value: 'Einlegen' },
    { id: 3, value: 'Fermentieren' },
    { id: 4, value: 'Räuchern' },
    { id: 5, value: 'Grillen' },
    { id: 6, value: 'Marmelade oder Gelee' },
    { id: 7, value: 'Saft' },
    { id: 8, value: 'Einfrieren' },
    { id: 9, value: 'Pürieren' },
    { id: 10, value: 'Kandieren' },
    { id: 11, value: 'Konfitüre' },
    { id: 12, value: 'Einkochen' },
    { id: 13, value: 'Marinieren' },
    { id: 14, value: 'Braten' },
    { id: 15, value: 'Dampfgaren' },
    { id: 16, value: 'Sautieren' },
    { id: 17, value: 'Backen' },
  ];

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('Heinz Farmer', Validators.required),
      email: new FormControl('', Validators.required),
      productName: new FormControl('', Validators.required),
      productDescription: new FormControl(''),
    });
  }
}
