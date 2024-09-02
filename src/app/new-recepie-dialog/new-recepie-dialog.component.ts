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
import { MultiSelectModule } from 'primeng/multiselect';

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
    MultiSelectModule
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
  
  guestsOptions = [
    { label: 'Kinder', value: 'children' },
    { label: 'Erwachsene', value: 'adults' },
    { label: 'Senioren', value: 'elderly' },
    { label: 'Vegetarier', value: 'vegetarians' },
    { label: 'Veganer', value: 'vegans' },
    { label: 'Sportler', value: 'athletes' },
    { label: 'Schwangere', value: 'pregnant_women' },
    { label: 'Allergiker', value: 'allergy_sufferers' },
    { label: 'Diabetiker', value: 'diabetics' },
    { label: 'Laktoseintolerant', value: 'lactose_intolerant' },
    { label: 'Glutenintolerant', value: 'gluten_intolerant' },
    { label: 'Halal', value: 'halal' },
    { label: 'Koscher', value: 'kosher' },
    { label: 'Fructoseintolerant', value: 'fructose_intolerant' },
    { label: 'Histaminintolerant', value: 'histamine_intolerant' },
    { label: 'Säuglinge', value: 'infants' },
    { label: 'Teenager', value: 'teenagers' },
    { label: 'Pescetarier', value: 'pescetarians' },
    { label: 'Ketogene Diät', value: 'ketogenic' },
    { label: 'Paleo Diät', value: 'paleo' },
    { label: 'Niedrigkalorisch', value: 'low_calorie' },
    { label: 'Niedriger Natriumgehalt', value: 'low_sodium' },
    { label: 'Hoher Proteingehalt', value: 'high_protein' },
    { label: 'Niedriger Fettgehalt', value: 'low_fat' },
    { label: 'Ohne Zuckerzusatz', value: 'no_added_sugar' },
    { label: 'Vegetarisch mit Fisch', value: 'vegetarian_with_fish' },
    { label: 'Rohkost', value: 'raw_food' },
  ];
  
  allergeneOptions = [
    { label: 'Gluten', value: 'gluten' },
    { label: 'Nüsse', value: 'nuts' },
    { label: 'Milchprodukte', value: 'dairy' },
    { label: 'Eier', value: 'eggs' },
    { label: 'Fisch', value: 'fish' },
    { label: 'Schalentiere', value: 'shellfish' },
    { label: 'Erdnüsse', value: 'peanuts' },
    { label: 'Soja', value: 'soy' },
    { label: 'Sesam', value: 'sesame' },
    { label: 'Sellerie', value: 'celery' },
    { label: 'Senf', value: 'mustard' },
    { label: 'Lupinen', value: 'lupins' },
    { label: 'Weichtiere', value: 'molluscs' },
    { label: 'Sulfite', value: 'sulfites' },
    { label: 'Krebstiere', value: 'crustaceans' },
    { label: 'Kuhmilcheiweiß', value: 'cow_milk_protein' },
    { label: 'Histamin', value: 'histamine' },
    { label: 'Fruktose', value: 'fructose' },
    { label: 'Farbstoffe', value: 'food_colorings' },
    { label: 'Konservierungsstoffe', value: 'preservatives' },
    { label: 'Alkohol', value: 'alcohol' },
    { label: 'Weizen', value: 'wheat' },
    { label: 'Schwefeldioxid', value: 'sulfur_dioxide' },
    { label: 'Gelatine', value: 'gelatine' },
    { label: 'Hefe', value: 'yeast' },
    { label: 'Mais', value: 'corn' },
    { label: 'Mohn', value: 'poppy_seeds' },
    { label: 'Kakao', value: 'cocoa' },
  ];
  

  saisonOptions = [
    { label: 'Sommer', value: 'spring' },
    { label: 'Frühling', value: 'summer' },
    { label: 'Herbst', value: 'autumn' },
    { label: 'Winter', value: 'winter' },
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
      essensgaeste: [[]],  // Changed to array for multi-select
      allergene: [[]],     // Changed to array for multi-select
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
  

  onFilter(event: any, index: number) {
    const filterValue = event.filter.trim().toLowerCase();
    const ingredientFormGroup = this.ingredients.at(index) as FormGroup;
    let filteredOptions = [];

    // Check if the filter is empty, reset to all ingredients
    if (!filterValue) {
        filteredOptions = [...this.allIngredients];
    } else {
        // Filter options based on the search string
        filteredOptions = this.allIngredients.filter(option =>
            option.label.toLowerCase().includes(filterValue)
        );

        // Check if the filterValue is already in the filtered options
        const filterValueExists = filteredOptions.some(option =>
            option.label.toLowerCase() === filterValue
        );

        // If the filterValue does not exist in the filtered options, add it as a fallback option
        if (!filterValueExists) {
            filteredOptions = [
                ...filteredOptions,
                {
                    label: `${filterValue}`,
                    value: filterValue,
                }
            ];
        }
    }

    // Update the form group with the filtered options
    ingredientFormGroup.patchValue({ ingredientOptions: filteredOptions });
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
      anleitung: [''],
    });
  }

  addStep() {
    this.steps.push(this.createStep());
  }

  removeImage(stepIndex: number, imageIndex: number): void {
    // Check if the stepIndex exists in stepImages
    if (this.stepImages[stepIndex]) {
      // Remove the image at the specified imageIndex
      this.stepImages[stepIndex].splice(imageIndex, 1);
    }
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
      ingredientOptions: [this.allIngredients] // Initialize with all ingredients
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

  removeRecipeImage(): void {
    this.recipeImage = null;
  }
  clearAllUploadedImages(): void {
    this.stepImages = {}
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
        this.removeRecipeImage();
        this.clearAllUploadedImages();
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
