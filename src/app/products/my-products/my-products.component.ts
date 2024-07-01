import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss',
  standalone: true,
  imports: [],
})
export class MyProductsComponent implements OnInit {
  ngOnInit(): void {}
  openAddProductDialog() {}
}
