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
import { TableModule } from 'primeng/table';
import { GalleriaModule } from 'primeng/galleria';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CheckboxModule } from 'primeng/checkbox';

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
    ConfirmDialogModule,
    TableModule,
    GalleriaModule,
    DropdownModule,
    OverlayPanelModule,
    CheckboxModule
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
  responsiveOptions: any[] = [];
  selectedTags: { [key: string]: boolean } = {};

  units = [
    { label: 'Gramm', value: 'g' },
    { label: 'Kilogramm', value: 'kg' },
    { label: 'Liter', value: 'l' },
    { label: 'Milliliter', value: 'ml' },
    { label: 'Stück', value: 'pcs' },
    { label: 'Teelöffel', value: 'tsp' },
    { label: 'Esslöffel', value: 'tbsp' },
    { label: 'Tassen', value: 'cup' },
    { label: 'Pfund', value: 'lb' },
    { label: 'Unzen', value: 'oz' },
    { label: 'Pakete', value: 'pkg' },
    { label: 'Scheiben', value: 'slices' },
    { label: 'Prisen', value: 'pinch' },
    { label: 'Dosen', value: 'cans' },
    { label: 'Flaschen', value: 'bottles' },
    { label: 'Gläser', value: 'jars' },
    { label: 'Zentiliter', value: 'cl' },
    { label: 'Milligramm', value: 'mg' },
    { label: 'Dekagramm', value: 'dag' },
    { label: 'Gallonen', value: 'gallon' },
    { label: 'Pints', value: 'pint' },
    { label: 'Quarts', value: 'quart' },
    { label: 'Stangen', value: 'sticks' },
    { label: 'Blätter', value: 'leaves' },
    { label: 'Becher', value: 'beaker' },
    { label: 'Kellen', value: 'ladle' },
    { label: 'Zweige', value: 'sprigs' },
    { label: 'Köpfe', value: 'heads' },
    { label: 'Zehen', value: 'cloves' }, 
    { label: 'Schalen', value: 'peels' }, 
    { label: 'Hände', value: 'hands' },
    { label: 'Bündel', value: 'bunches' },
    { label: 'Blöcke', value: 'blocks' },
    { label: 'Scheiben', value: 'slices' }, 
    { label: 'Körner', value: 'grains' },
  ];

  dietOptions = [
    { label: 'Vegan', value: 'vegan' },
    { label: 'Vegetarisch', value: 'vegetarian' },
    { label: 'Glutenfrei', value: 'gluten_free' },
    { label: 'Laktosefrei', value: 'dairy_free' },
    { label: 'Paleo', value: 'paleo' },
    { label: 'Ketogen', value: 'ketogenic' },
    { label: 'Pescetarisch', value: 'pescetarian' },
    { label: 'Rohkost', value: 'raw_food' },
    { label: 'Frutarier', value: 'fruitarian' },
    { label: 'Flexitarier', value: 'flexitarian' },
    { label: 'Low Carb', value: 'low_carb' },
    { label: 'High Protein', value: 'high_protein' },
    { label: 'Zuckerfrei', value: 'sugar_free' },
    { label: 'Nussfrei', value: 'nut_free' },
    { label: 'Südstrand-Diät', value: 'south_beach_diet' },
    { label: 'Mittelmeer-Diät', value: 'mediterranean_diet' },
    { label: 'FODMAP-arm', value: 'low_fodmap' },
    { label: 'Kohlenhydratarm', value: 'low_carbohydrate' },
    { label: 'Proteinreich', value: 'high_protein' },
    { label: 'Fettarm', value: 'low_fat' },
    { label: 'Keine Konservierungsstoffe', value: 'no_preservatives' },
  ];

  getDietLabel(value: string): string {
    const option = this.dietOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

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

    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 5
      },
      {
        breakpoint: '768px',
        numVisible: 3
      },
      {
        breakpoint: '560px',
        numVisible: 1
      }
    ];
  }

  fetchRecipe(): void {
    this.loading = true;
    this.storeService.selectedCompanyContext$
      .pipe(
        switchMap(company => {
          if (company && company.id) {
            // Fetch the recipe details without images
            return this.recipeService.getRecipeById(this.recipeId, false);
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
        } else {
          // Fetch images for each step asynchronously
          this.recipe.steps.forEach((step: { images: string[] | never[]; }, index: number) => {
            this.recipeService.getStepImages(this.recipeId, index)
              .pipe(
                catchError(error => {
                  if (error.status === 404) {
                    // No images found for this step, return an empty array without logging an error
                    return of([]);
                  } else {
                    console.error(`Error fetching images for step ${index}:`, error);
                    this.messageService.add({ severity: 'error', summary: 'Error fetching images', detail: `Failed to fetch images for step ${index}` });
                    return of([]);
                  }
                })
              )
              .subscribe(images => {
                step.images = images;
              });
          });
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
        console.error('Full error response:', err);
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

  toggleDiet(diet: string): void {
    const index = this.recipe.diets.indexOf(diet);
    if (index > -1) {
      this.recipe.diets.splice(index, 1);
    } else {
      this.recipe.diets.push(diet);
    }
  }
}
