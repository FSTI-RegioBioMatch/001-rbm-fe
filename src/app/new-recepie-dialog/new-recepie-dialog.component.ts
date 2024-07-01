import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
@Component({
  selector: 'app-new-recepie-dialog',
  standalone: true,
  imports: [MatOptionModule, MatChipsModule, MatDividerModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './new-recepie-dialog.component.html',
  styleUrl: './new-recepie-dialog.component.scss'
})
export class NewRecepieDialogComponent {
  recipeForm!: FormGroup;
  categories = [
    { name: 'Vegan', control: new FormControl(false) },
    { name: 'Vegetarisch', control: new FormControl(false) },
    // Add other categories here
  ];
  units = ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'piece']; // Example units

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      recipeName: ['', Validators.required],
      categories: this.fb.array(this.categories.map(category => category.control)),
      ingredients: this.fb.array([this.createIngredient()])
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  createIngredient(): FormGroup {
    return this.fb.group({
      component: [''],
      ingredient: [''],
      quantity: [''],
      unit: ['']
    });
  }

  addIngredient(): void {
    const ingredientArray = this.ingredients;
    const lastIngredient = ingredientArray.at(ingredientArray.length - 1);
    
    // Check if last ingredient form group is valid before adding a new one
    if (lastIngredient.valid) {
      ingredientArray.push(this.createIngredient());
    }
  }

  saveRecipe(): void {
    if (this.recipeForm.valid) {
      console.log('Recipe data:', this.recipeForm.value);
      // Implement save functionality
    } else {
      console.log('Form is not valid');
    }
  }
}