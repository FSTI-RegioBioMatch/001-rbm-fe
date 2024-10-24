import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { switchMap, filter } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { NewShoppingListService } from '../shared/services/new-shopping-list.service';
import { StoreService } from '../shared/store/store.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    RouterLink,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './shopping-list-overview.component.html',
  styleUrls: ['./shopping-list-overview.component.scss']
})
export class ShoppingListOverviewComponent implements OnInit {

  searchForm: FormGroup;
  shoppingLists: any[] = [];
  filteredShoppingLists: any[] = [];
  loading = false;
  
  // Add the German locale configuration
  de: any;

  constructor(
    private shoppingListService: NewShoppingListService,
    private storeService: StoreService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.searchForm = new FormGroup({
      name: new FormControl(''),
      recipe: new FormControl(''),
      menuPlan: new FormControl(''),
      date: new FormControl(null)
    });
  }

  ngOnInit(): void {
      // Define the German locale configuration
      this.de = {
        firstDayOfWeek: 1,
        dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        today: 'Heute',
        clear: 'Löschen'
      };

      this.loading = true;
  
      this.storeService.selectedCompanyContext$
        .pipe(
          filter(company => company !== null),
          switchMap(company => this.shoppingListService.getAllShoppingLists())
        )
        .subscribe({
          next: (lists) => {
            this.shoppingLists = lists || [];
            this.filteredShoppingLists = this.shoppingLists;
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Einkaufsliste konnte nicht geladen werden' });
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
    this.router.navigate(['/shopping-list-detail', list.id]);
  }
}
