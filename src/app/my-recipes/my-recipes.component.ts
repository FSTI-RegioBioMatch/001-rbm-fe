import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RecipeService } from '../shared/services/recipe.service';
import { StoreService } from '../shared/store/store.service';
import { filter, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { NewRecepieDialogComponent } from '../new-recepie-dialog/new-recepie-dialog.component';
import { MessageService } from 'primeng/api';
import { Toast, ToastModule } from 'primeng/toast';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoggingService } from '../shared/services/logging.service';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DropdownModule,
    PaginatorModule,
    ButtonModule,
    ProgressSpinnerModule,
    InputTextModule,
    CalendarModule,
    RouterModule,
    DialogModule,
    NewRecepieDialogComponent,
    ToastModule,
    SidebarComponent,
  ],
  providers: [MessageService],
  templateUrl: './my-recipes.component.html',
  styleUrls: ['./my-recipes.component.scss'],
})
export class MyRecipesComponent implements OnInit, AfterViewInit {
  displayAddRecipeDialog: boolean = false;
  recipes: any[] = [];
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  pageSizes: number[] = [5, 10, 20, 50];
  loading: boolean = false;
  searchName: string = '';
  sortOptions: any[] = [
    { label: 'A-Z', value: 'recipeName,asc' },
    { label: 'Z-A', value: 'recipeName,desc' }
  ];
  selectedSortOption: string = this.sortOptions[0].value;
  fromDate: Date | null = null;
  toDate: Date | null = null;

  actionOptions = [
    { label: 'Details', value: 'details' },
    { label: 'Edit', value: 'edit' },
    { label: 'Delete', value: 'delete' }
  ];

  selectedAction: string | null = null;

  constructor(
    private store: StoreService,
    private router: Router,
    private recipeService: RecipeService,
    private messageService: MessageService,
    private logService: LoggingService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.loading = true;
    const seasons = this.getSeasonsFromDateRange(this.fromDate, this.toDate);
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null && company.id !== undefined),
        switchMap(company =>
          this.recipeService.getRecipesByCompanyId(
            this.currentPage,
            this.pageSize,
            this.selectedSortOption,
            this.searchName,
            seasons
          )
        )
      )
      .subscribe(
        page => {
          this.recipes = page.content;
          this.totalElements = page.totalElements;
          this.loading = false;
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Rezepte konnten nicht abgerufen werden.' });
          console.error('Error fetching recipes:', error);
          const errorDetails = typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error);
          this.logService.log(
            'Error fetching recipes.', // Message
            'ERROR',                       // Log level
            { error: errorDetails },      // Additional data (error details)
            new Date().toISOString(),       // timestamp
            'currentUserId'                 // userId (replace with actual user ID if available)
          );
          this.loading = false;
        }
      );
  }

  getSeasonsFromDateRange(fromDate: Date | null, toDate: Date | null): string[] {
    if (!fromDate || !toDate) {
      return [];
    }

    const seasons = [];
    const startMonth = fromDate.getMonth() + 1;
    const endMonth = toDate.getMonth() + 1;

    if ((startMonth <= 2 || startMonth === 12) || (endMonth <= 2 || endMonth === 12)) {
      seasons.push('Winter');
    }
    if ((startMonth <= 5 && startMonth >= 3) || (endMonth <= 5 && endMonth >= 3)) {
      seasons.push('Spring');
    }
    if ((startMonth <= 8 && startMonth >= 6) || (endMonth <= 8 && endMonth >= 6)) {
      seasons.push('Summer');
    }
    if ((startMonth <= 11 && startMonth >= 9) || (endMonth <= 11 && endMonth >= 9)) {
      seasons.push('Autumn');
    }

    return seasons;
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadRecipes();
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadRecipes();
  }

  onDateRangeChange(): void {
    this.currentPage = 0;
    this.loadRecipes();
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadRecipes();
  }

  onNextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalElements) {
      this.currentPage++;
      this.loadRecipes();
    }
  }

  onPrevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadRecipes();
    }
  }

  onClickCreateMenuPlan() {
    this.router.navigate(['/menu-planning']);
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/recipe-details', recipeId]);
  }



  getFromToRange(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    return `${start} - ${end} von ${this.totalElements}`;
  }
  openAddRecipeDialog(): void {
    this.displayAddRecipeDialog = true;
  }

  onRecipeSaved(): void {
    this.onCloseAddRecipeDialog(); // Close the dialog
    this.loadRecipes(); // Reload the recipes
  }
  
  onCloseAddRecipeDialog(): void {
    this.displayAddRecipeDialog = false;
  }
}
