import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';

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
    ToastModule,
  ],
  providers: [MessageService],
})
export class NewRecepieDialogComponent implements OnInit {
  @Output() closeDialog = new EventEmitter<void>();
  ingredientOptions: { label: string; value: string }[] = [];
  allIngredients: { label: string; value: string }[] = [];
  pageSize = 50; // Number of items to load at once
  loading = false;
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

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private http: HttpClient,
    private messageService: MessageService,
    private nearbuyTestService: NearbuyTestService,
  ) {
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
      selectedDiets: this.fb.group(
        // FormGroup mit mehreren FormControls
        this.dietOptions.reduce(
          (acc, option) => {
            acc[option.value] = [false];
            return acc;
          },
          {} as { [key: string]: any },
        ),
      ),
    });
  }
  ngOnInit() {
    this.fetchIngredientOptions();
  }

  fetchIngredientOptions() {
    this.nearbuyTestService.getData().subscribe(
      (data) => {
        // Store all ingredients for manual filtering
        this.allIngredients = data.map((item) => ({
          label: item.displayLabel,
          value: item.value,
        }));
  
        // Initially set ingredientOptions to allIngredients
        this.ingredientOptions = [...this.allIngredients];
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch and map data.',
        });
        console.error('Error fetching and mapping data:', error);
      },
    );
  }
  

  onFilter(event: any) {
    const filterValue = event.filter.trim().toLowerCase();
  
    // Check if the filter is empty, reset options
    if (!filterValue) {
      this.ingredientOptions = [...this.allIngredients];
      return;
    }
  
    // Use default filtering
    const filteredOptions = this.allIngredients.filter(option =>
      option.label.toLowerCase().includes(filterValue)
    );
  
    if (filteredOptions.length > 0) {
      // Set ingredientOptions to filtered results if found
      this.ingredientOptions = filteredOptions;
    } else {
      // No results found, show the search string as a selectable option
      this.ingredientOptions = [
        {
          label: `${filterValue}`,
          value: filterValue,
        },
      ];
    }
  }
  
  
  loadMore(event: any) {
    const loadedItems = this.ingredientOptions.length;
    const moreItems = this.allIngredients.slice(
      loadedItems,
      loadedItems + this.pageSize,
    );
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
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Bitte fülle alle Felder aus.',
      });
      return;
    }

    this.loading = true;
    this.form.disable(); // Disable the form

    const recipeData = this.form.value;
    recipeData.steps = recipeData.steps.map((step: any, index: number) => ({
      ...step,
      images: this.stepImages[index] || [],
    }));
    recipeData.diets = Object.keys(this.selectedDiets).filter(
      (key) => this.selectedDiets[key],
    );
    recipeData.recipeImage = this.recipeImage;
    recipeData.nearbuyId = '1234'; // Replace with actual nearbuy ID

    this.recipeService.saveRecipe(recipeData).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Rezept gespeichert!',
        });
        this.loading = false;
        this.form.reset(); // Reset the form
        this.form.enable(); // Re-enable the form
        //this.closeDialog.emit(); // Close the dialog if needed
      },
      (error) => {
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save the recipe.',
        });
        this.loading = false;
        this.form.enable(); // Re-enable the form
      },
    );
  }
}
