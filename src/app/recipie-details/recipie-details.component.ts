import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../shared/services/recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-recipie-details',
  standalone: true,
  templateUrl: './recipie-details.component.html',
  styleUrls: ['./recipie-details.component.scss'],
  imports: [
    CommonModule,
  ],
})
export class RecipieDetailsComponent {
  recipe: any | null = null;
  recipeId: string = '';

  constructor(private recipeService: RecipeService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.recipeId = params.get('id') ?? '';
      this.fetchRecipe();
    });
  }

  fetchRecipe(): void {
    let a = 2;
    if (this.recipeId) {
      this.recipeService.getRecipeById(this.recipeId).subscribe(
        (data: any) => {
          this.recipe = data;
          console.log('Recipe fetched', this.recipe);
          if (!this.recipe) {
            this.router.navigate(['/my-recipes']);
          }
        },
        (error) => {
          this.router.navigate(['/my-recipes']);
          console.error('Error fetching recipe', error);
        }
      );
    }
  }
}