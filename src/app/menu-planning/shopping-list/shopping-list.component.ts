import { Component, OnInit } from '@angular/core';
import { ShoppingListService } from '../../shared/services/shopping-list.service';
import { ShoppingListType } from '../../shared/types/shopping-list.type';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CardModule, TableModule],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent implements OnInit {
  shoppingList: ShoppingListType[] = [];

  constructor(
    private shoppingListService: ShoppingListService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getShoppingLists();
  }

  getShoppingLists() {
    this.shoppingListService
      .getShoppingListByCompanyId()
      .subscribe((shoppingLists) => {
        console.log('shopping lists', shoppingLists);
        this.shoppingList = shoppingLists;
      });
  }

  onClickShoppingListItem(shoppingList: ShoppingListType) {
    console.log('shopping list item clicked', shoppingList);
    this.router.navigate(['/menu-planning/shopping-list', shoppingList.id]);
  }
}
