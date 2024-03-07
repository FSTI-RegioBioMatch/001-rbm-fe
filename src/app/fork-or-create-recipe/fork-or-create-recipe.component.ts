import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TheMealDbService } from '../shared/services/the-meal-db.service';
import {
  Meals,
  MealTheMealDbType,
} from '../community-recipes/types/meal-the-meal-db.type';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { MatOption, MatSelect } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { Area } from '../shared/types/mealdb-area.type';
import { Category } from '../shared/types/mealdb-category.type';
import { MatButton } from '@angular/material/button';
import { MatChipGrid, MatChipInput, MatChipRow } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { Ingredient } from '../shared/types/mealdb-ingredient.type';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-fork-or-create-recipe',
  templateUrl: './fork-or-create-recipe.component.html',
  styleUrl: './fork-or-create-recipe.component.scss',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    KeyValuePipe,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatButton,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatChipInput,
    MatProgressSpinner,
  ],
})
export class ForkOrCreateRecipeComponent implements OnInit {
  loading = true;

  meal!: MealTheMealDbType;
  areas: Area[] = [];
  categories: Category[] = [];
  ingredientsList: Ingredient[] = [];

  form: FormGroup;
  mealId!: string | null;

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  constructor(
    private router: ActivatedRoute,
    private mealDbService: TheMealDbService,
    private fb: FormBuilder,
  ) {
    this.form = new FormGroup({
      strArea: new FormControl('', Validators.required),
      strCategory: new FormControl('', Validators.required),
      strInstructions: new FormControl('', Validators.required),
      strMeal: new FormControl('', Validators.required),
      strMealThumb: new FormControl('', Validators.required),
      strTags: new FormControl('', Validators.required),
      ingredients: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.getRouterPathParam();

    forkJoin({
      categories: this.mealDbService.getCategories(),
      areas: this.mealDbService.getAreas(),
      ingredients: this.mealDbService.getIngredients(),
    }).subscribe(({ categories, areas, ingredients }) => {
      console.log('Categories:', categories);
      console.log('Areas:', areas);
      console.log('Ingredients:', ingredients);
      this.categories = categories.meals;
      this.areas = areas.meals;
      this.ingredientsList = ingredients.meals;

      this.loading = false;
    });
  }

  private getRouterPathParam() {
    this.router.paramMap.subscribe((params) => {
      this.mealId = params.get('id');
      if (this.mealId) {
        this.getMealById(this.mealId);
      }
    });
  }

  addIngredientFormGroup(ingredient: string, measure: string) {
    return this.fb.group({
      strIngredient: [ingredient, Validators.required],
      strMeasure: [measure, Validators.required],
    });
  }

  addIngredient() {
    this.ingredients.push(this.addIngredientFormGroup('', ''));
  }

  testSend() {
    console.log(this.form);
  }

  private getMealById(mealId: string) {
    this.mealDbService.getMealById(mealId).subscribe((meal) => {
      this.meal = meal.meals[0];
      this.form.get('strArea')?.setValue(this.meal.strArea);
      this.form.get('strCategory')?.setValue(this.meal.strCategory);
      this.form.get('strInstructions')?.setValue(this.meal.strInstructions);
      this.form.get('strMeal')?.setValue(this.meal.strMeal);
      this.form.get('strMealThumb')?.setValue(this.meal.strMealThumb);
      this.form.get('strTags')?.setValue(this.meal.strTags);

      const elementCounter = 20;

      for (let index = 0; index < elementCounter; index++) {
        const mealS = this.meal[
          `strIngredient${index}` as keyof MealTheMealDbType
        ] as string;
        const measureM = this.meal[
          `strMeasure${index}` as keyof MealTheMealDbType
        ] as string;

        if (mealS) {
          // this.form.addControl(
          //   `strIngredient${index}`,
          //   new FormControl(mealS, Validators.required),
          // );
          // this.form.addControl(
          //   `strMeasure${index}`,
          //   new FormControl(measureM, Validators.required),
          // );
          this.ingredients.push(this.addIngredientFormGroup(mealS, measureM));
        }
      }
      // this.form.addControl();
      console.log(this.meal);
      console.log(this.form);
    });
  }
}
