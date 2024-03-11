import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddProductModalComponent } from './components/add-product-modal/add-product-modal.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatDatepicker,
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatInput } from '@angular/material/input';
import { MatButton, MatFabButton } from '@angular/material/button';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    MatDatepickerInput,
    MatInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatFabButton,
    MatLabel,
  ],
})
export class MyProductsComponent implements OnInit {
  constructor(private dialog: MatDialog) {}
  ngOnInit(): void {}
  openAddProductDialog() {
    const dialogRef = this.dialog.open(AddProductModalComponent, {
      width: '1300px',
      height: 'auto',
    });
  }
}
