import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
import { MatButton } from '@angular/material/button';
import { MatChipGrid, MatChipInput, MatChipRow } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Area } from '../shared/types/mealdb-area.type';
import { Category } from '../shared/types/mealdb-category.type';
import { Ingredient } from '../shared/types/mealdb-ingredient.type';

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

  ngOnInit(): void {}

  private getRouterPathParam() {
    this.router.paramMap.subscribe((params) => {
      this.mealId = params.get('id');
      if (this.mealId) {
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
}
