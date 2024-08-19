import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { switchMap, filter } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { NewShoppingListService } from '../shared/services/new-shopping-list.service';
import { StoreService } from '../shared/store/store.service';

@Component({
  selector: 'app-shopping-list-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    CalendarModule,
    InputTextModule,
    ButtonModule,
    RouterLink
  ],
  templateUrl: './shopping-list-overview.component.html',
  styleUrls: ['./shopping-list-overview.component.scss']
})
export class ShoppingListOverviewComponent implements OnInit {

  searchForm: FormGroup;
  shoppingLists: any[] = [];
  filteredShoppingLists: any[] = [];

  constructor(
    private shoppingListService: NewShoppingListService,
    private storeService: StoreService,
    private router: Router
  ) {
    this.searchForm = new FormGroup({
      name: new FormControl(''),
      recipe: new FormControl(''),
      menuPlan: new FormControl(''),
      date: new FormControl(null)
    });
  }

  ngOnInit(): void {
    this.storeService.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company => this.shoppingListService.getAllShoppingLists())
      )
      .subscribe({
        next: (lists) => {
          this.shoppingLists = lists || [];
          this.filteredShoppingLists = this.shoppingLists;
        },
        error: (error) => {
          console.error('Error loading shopping lists:', error);
        }
      });

    this.searchForm.valueChanges.subscribe(() => this.filterShoppingLists());
  }

  filterShoppingLists(): void {
    const { name, recipe, menuPlan, date } = this.searchForm.value;

    this.filteredShoppingLists = this.shoppingLists.filter(list => {
      const matchesName = name ? this.getMenuPlanNames(list).toLowerCase().includes(name.toLowerCase()) : true;
      const matchesRecipe = recipe ? this.getRecipeNames(list).toLowerCase().includes(recipe.toLowerCase()) : true;
      const matchesMenuPlan = menuPlan ? this.getMenuPlanDetails(list).toLowerCase().includes(menuPlan.toLowerCase()) : true;
      const matchesDate = date ? new Date(list.createdAt).toLocaleDateString() === new Date(date).toLocaleDateString() : true;

      return matchesName && matchesRecipe && matchesMenuPlan && matchesDate;
    });
  }

  getMenuPlanNames(list: any): string {
    return list.menuPlans ? list.menuPlans.map((plan: any) => plan.name).join(', ') : '';
  }

  getRecipeNames(list: any): string {
    return list.menuPlans ? list.menuPlans.map((plan: any) => plan.recipes.map((rec: any) => rec.name).join(', ')).join(', ') : '';
  }

  getMenuPlanDetails(list: any): string {
    return list.menuPlans ? list.menuPlans.map((plan: any) => plan.name).join(', ') : '';
  }

  onRowSelect(list: any): void {
    this.router.navigate(['/shopping-list-detail', list.id]); // Navigate to the detail page with the selected list's ID
  }
}
