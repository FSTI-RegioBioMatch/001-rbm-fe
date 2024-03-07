import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-add-product-modal',
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.scss',
  standalone: true,
  imports: [MatFormField, ReactiveFormsModule, MatInput, MatLabel, MatDivider],
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
