import { Component, OnInit } from '@angular/core';
import { ShoppingListService } from '../../../shared/services/shopping-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ShoppingListType } from '../../../shared/types/shopping-list.type';
import { Button } from 'primeng/button';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-shopping-list-detailed',
  standalone: true,
  imports: [PrimeTemplate, TableModule, Button],
  templateUrl: './shopping-list-detailed.component.html',
  styleUrl: './shopping-list-detailed.component.scss',
})
export class ShoppingListDetailedComponent implements OnInit {
  loading = true;
  shoppingList!: ShoppingListType;
  id!: string;

  constructor(
    private shoppingListService: ShoppingListService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      console.log('id', params['id']);
      this.id = params['id'];
      this.shoppingListService
        .getShoppingListByCompanyIdAndId(this.id)
        .subscribe((shoppingList) => {
          console.log('shopping list', shoppingList);
          this.shoppingList = shoppingList;
          this.loading = false;
        });
    });
  }

  onClickGoToOffer() {
    const scanId = uuidv4();
    this.router.navigate([
      `/menu-planning/shopping-list/${this.id}/offer-scan/${scanId}'`,
    ]);
  }
}
