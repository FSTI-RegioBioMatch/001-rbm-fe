import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../shared/services/recipe.service';
import { StoreService } from '../shared/store/store.service';
import { PrivateRecipeTableComponent } from './components/private-recipe-table/private-recipe-table.component';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [PrivateRecipeTableComponent],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
})
export class MyRecipesComponent implements OnInit, AfterViewInit {
  recipes: any[] = [];
  totalElements: number = 0;

  constructor(
    private store: StoreService,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null), // Ensure a non-null value is emitted
        switchMap(company =>
          this.recipeService.getRecipesByCompanyId(0, 10, 'recipeName,asc')
        )
      )
      .subscribe(
        page => {
          this.recipes = page.content;
          this.totalElements = page.totalElements;
          console.log('Recipes:', this.recipes);
          console.log('Total Elements:', this.totalElements);
        },
        error => {
          console.error('Error fetching recipes:', error);
        }
      );
  }

  onClickCreateMenuPlan() {
    console.log('Create Menu Plan');
    // this.store.selectedPublicRecipeSubject.next(this.selected);
    this.router.navigate(['/menu-planning']);
  }
}
