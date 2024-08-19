import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { RecipeService } from '../shared/services/recipe.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-recepie-dialog',
  standalone: true,
  templateUrl: './new-recepie-dialog.component.html',
  styleUrls: ['./new-recepie-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    ButtonModule,
    InputSwitchModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    CheckboxModule,
    ChipModule,
    FormsModule,
  ],
})


export class NewRecepieDialogComponent implements OnInit {
  ingredientOptions: { label: string, value: string }[] = [];
  allIngredients: { label: string, value: string }[] = [];
  pageSize = 50; // Number of items to load at once
  units = [
    { label: 'Grams', value: 'g' },
    { label: 'Kilograms', value: 'kg' },
    { label: 'Liters', value: 'l' },
    { label: 'Milliliters', value: 'ml' },
  ];

  kitchenOptions = [
    { label: 'Italian', value: 'italian' },
    { label: 'Chinese', value: 'chinese' },
    { label: 'Mexican', value: 'mexican' },
    // Add more options as needed
  ];

  guestsOptions = [
    { label: 'children', value: 'children' },
    { label: 'adults', value: 'adults' },
    { label: 'elderly', value: 'elderly' },
    // Add more options as needed
  ];

  allergeneOptions = [
    { label: 'Gluten', value: 'gluten' },
    { label: 'Nuts', value: 'nuts' },
    { label: 'Dairy', value: 'dairy' },
    // Add more options as needed
  ];

  saisonOptions = [
    { label: 'Spring', value: 'spring' },
    { label: 'Summer', value: 'summer' },
    { label: 'Autumn', value: 'autumn' },
    { label: 'Winter', value: 'winter' },
    // Add more options as needed
  ];

  dietOptions = [
    { label: 'Vegan', value: 'vegan' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Gluten-Free', value: 'gluten-free' },
    { label: 'Dairy-Free', value: 'dairy-free' },
    // Add more options as needed
  ];

  selectedDiets: { [key: string]: boolean } = {};
  recipeImage: string | null = null;

  form: FormGroup;
  stepImages: { [key: number]: string[] } = {}; // Store image URLs for each step
  showNote: { [key: number]: boolean } = {}; // Track visibility of note fields

  constructor(private fb: FormBuilder, private recipeService: RecipeService, private http: HttpClient) {
    this.form = this.fb.group({
      recipeName: ['', Validators.required],
      recipeDescription: [''],
      includeInMenuPlanning: [false],
      publishAsCommunityRecipe: [false],
      steps: this.fb.array([this.createStep()]),
      ingredients: this.fb.array([this.createIngredient()]),
      energie: [''],
      portionen: [''],
      besonderheiten: [''],
      essensgaeste: [''],
      allergene: [''],
      saison: [''],
      selectedDiets: this.fb.group( // FormGroup mit mehreren FormControls
        this.dietOptions.reduce((acc, option) => {
          acc[option.value] = [false];
          return acc;
        }, {} as { [key: string]: any })
      ),
    });
  }
  ngOnInit() {
    this.fetchIngredientOptions();
  }
  fetchIngredientOptions() {
    const url = 'https://api.locize.app/ad439f20-6ec0-41f8-af94-ebd3cf1b9b90/latest/de/ontofood';
    this.http.get<{ [key: string]: string }>(url).subscribe(
      (data) => {
        this.allIngredients = Object.keys(data).map(key => ({
          label: data[key],
          value: key,
        }));
        // Load the first batch
        this.ingredientOptions = this.allIngredients.slice(0, this.pageSize);
      },
      (error) => {
        console.error('Error fetching ingredient data:', error);
      }
    );
  }

  loadMore(event: any) {
    const loadedItems = this.ingredientOptions.length;
    const moreItems = this.allIngredients.slice(loadedItems, loadedItems + this.pageSize);
    this.ingredientOptions = [...this.ingredientOptions, ...moreItems];
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  createStep(): FormGroup {
    return this.fb.group({
      schritt: ['', Validators.required],
      anleitung: ['', Validators.required],
    });
  }

  addStep() {
    this.steps.push(this.createStep());
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  createIngredient(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      unit: ['', Validators.required],
      optional: [false],
      note: [''], // Note field
      alternatives: this.fb.array([]), // Array to hold alternative ingredients
    });
  }

  addIngredient() {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  createAlternative(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      unit: ['', Validators.required],
    });
  }

  addAlternativeIngredient(index: number) {
    const alternatives = this.getAlternatives(index);
    alternatives.push(this.createAlternative());
  }

  removeAlternativeIngredient(
    ingredientIndex: number,
    alternativeIndex: number,
  ) {
    const alternatives = this.getAlternatives(ingredientIndex);
    alternatives.removeAt(alternativeIndex);
  }

  getAlternatives(index: number): FormArray {
    return this.ingredients.at(index).get('alternatives') as FormArray;
  }

  toggleNoteField(index: number) {
    this.showNote[index] = !this.showNote[index];
  }

  handleFileUpload(event: any, index: number, fileUpload: any) {
    const files = event.files;
    if (!this.stepImages[index]) {
      this.stepImages[index] = [];
    }

    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.stepImages[index].push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    fileUpload.clear();
  }

  handleRecipeImageUpload(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.recipeImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeRecipeImage() {
    this.recipeImage = null;
  }

  toggleDiet(value: string) {
    if (this.selectedDiets[value]) {
      this.selectedDiets[value] = false;
    } else {
      this.selectedDiets[value] = true;
    }
  }

  saveRecipe() {
    const recipeData = this.form.value;

    // Adding step images to the recipe data
    recipeData.steps = recipeData.steps.map((step: any, index: number) => ({
      ...step,
      images: this.stepImages[index] || [],
    }));

    // Adding selected diets to the recipe data
    recipeData.diets = Object.keys(this.selectedDiets).filter(
      (key) => this.selectedDiets[key],
    );

    // Adding the recipe image to the recipe data
    recipeData.recipeImage = this.recipeImage;

    recipeData.nearbuyId = '1234'; // Replace with actual nearbuy ID
    console.log(JSON.stringify(recipeData, null, 2));
    this.recipeService.saveRecipe(recipeData).subscribe((response) => {
      console.log(response);
    });
  }
}