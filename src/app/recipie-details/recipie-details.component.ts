import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../shared/services/recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { StoreService } from '../shared/store/store.service';
import { switchMap, catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-recipie-details',
  standalone: true,
  templateUrl: './recipie-details.component.html',
  styleUrls: ['./recipie-details.component.scss'],
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    ToastModule,
    ProgressSpinnerModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class RecipieDetailsComponent implements OnInit {
  recipe: any | null = null;
  recipeId: string = '';
  loading = true;
  editMode = false;
  deleting = false; // New state to track deletion process
  saving = false;   // New state to track saving process

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.recipeId = params.get('id') ?? '';
      if (!this.recipeId || this.recipeId === '') {
        this.router.navigate(['/my-recipes']);
      }
      this.fetchRecipe();
    });
  }

  fetchRecipe(): void {
    this.loading = true;
    this.storeService.selectedCompanyContext$
      .pipe(
        switchMap(company => {
          if (company && company.id) {
            return this.recipeService.getRecipeById(this.recipeId);
          } else {
            this.router.navigate(['/my-recipes']);
            return of(null);
          }
        }),
        catchError(error => {
          console.error('Error fetching recipe:', error);
          this.messageService.add({ severity: 'error', summary: 'Error fetching recipe', detail: error.message || 'Unknown error' });
          this.router.navigate(['/my-recipes']);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(recipe => {
        this.recipe = recipe;
        if (!this.recipe) {
          this.messageService.add({ severity: 'error', summary: 'Recipe not found', detail: 'The requested recipe could not be found.' });
          this.router.navigate(['/my-recipes']);
        }
        this.loading = false;
      });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  saveRecipe(): void {
    this.saving = true; // Start saving process
    this.recipeService.updateRecipeById(this.recipeId, this.recipe).subscribe({
      next: () => {
        this.editMode = false;
        this.messageService.add({ severity: 'success', summary: 'Recipe saved', detail: 'Recipe updated successfully' });
      },
      error: (err) => {
        console.error('Error saving recipe:', err);
        this.messageService.add({ severity: 'error', summary: 'Error saving recipe', detail: 'Failed to update recipe' });
      },
      complete: () => {
        this.saving = false; // End saving process
        this.fetchRecipe(); // Fetch the recipe again to update the view
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this recipe?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteRecipe();
      }
    });
  }

  deleteRecipe(): void {
    this.deleting = true; // Start deleting process
    this.recipeService.deleteRecipeById(this.recipeId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Recipe deleted', detail: 'Recipe deleted successfully' });
        setTimeout(() => {
          this.router.navigate(['/my-recipes']);
        }, 1200); // Delay of 1.2 seconds to allow the toast to be visible
      },
      error: (err) => {
        console.error('Error deleting recipe:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete recipe' });
      },
      complete: () => {
        this.deleting = false; // End deleting process
      }
    });
  }
}
