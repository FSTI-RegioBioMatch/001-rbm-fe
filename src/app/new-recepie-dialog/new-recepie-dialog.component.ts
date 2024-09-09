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
import { NgxImageCompressService } from 'ngx-image-compress';
import { CustomValidators } from '../shared/validators/custom-validators'; 
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoggingService } from '../shared/services/logging.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { OverlayPanelModule } from 'primeng/overlaypanel';

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
    MultiSelectModule,
    ProgressSpinnerModule,
    FloatLabelModule,
    OverlayPanelModule,
  ],
  providers: [MessageService],
})
export class NewRecepieDialogComponent implements OnInit {
  ingredientOptions: { label: string; value: string }[] = [];
  allIngredients: { label: string; value: string }[] = [];
  pageSize = 50; // Number of items to load at once
  loading = false;
  loadingIngredients = false;
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

  @Output() recipeSaved = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private recipeService: RecipeService,
    private messageService: MessageService,
    private nearbuyTestService: NearbuyTestService,
    private imageCompress: NgxImageCompressService,
    private logService: LoggingService,
  ) {
    this.form = this.fb.group({
      recipeName: ['', Validators.required],
      recipeDescription: ['', CustomValidators.optionalMinLength(1)],
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
    }, {
      validators: [
        CustomValidators.atLeastOneEntry('steps'),
        CustomValidators.atLeastOneEntry('ingredients')
    ]});
  }
  ngOnInit() {
    this.fetchIngredientOptions();
  }

  fetchIngredientOptions() {
    this.loadingIngredients = true;
    this.nearbuyTestService.getData().subscribe(
      (data) => {
        // Store all ingredients for manual filtering
        this.allIngredients = data.map((item) => ({
          label: item.displayLabel,
          value: item.value,
        }));
  
        // Initially set ingredientOptions to allIngredients
        this.ingredientOptions = [...this.allIngredients];
        this.loadingIngredients = false;
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch and map data.',
        });
        this.loadingIngredients = false;
        //console.error('Error fetching and mapping data:', error);
        this.logService.log(
          'Failed to fetch and map ingredient data.', // Message
          'ERROR',                                   // Log level
          { error: error.message },                   // Additional data (error object details)
          new Date().toISOString(),                   // timestamp
          'currentUserId'                             // userId (replace with actual user ID if available)
        );

      },
    );
  }
  
  getLoadingMessage(): string {
    if (this.loading) {
      return '';
    } else if (this.loadingIngredients) {
      return 'Lade Zutaten...';
    }
    return '';
  }

  getSelectedDiets() {
    return this.dietOptions.filter(diet => this.selectedDiets[diet.value]);
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
      anleitung: ['', CustomValidators.optionalMinLength(1) ],
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
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+([.,][0-9]+)?$'), Validators.min(0)]],
      unit: ['', Validators.required],
      optional: [false],
      note: ['', CustomValidators.optionalMinLength(1)], // Note field
      alternatives: this.fb.array([]), // Array to hold alternative ingredients
      ingredientOptions: []
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
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+([.,][0-9]+)?$'), Validators.min(0)]],
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

  async handleFileUpload(event: any, index: number, fileUpload: any) {
    const files = event.files;
    if (!this.stepImages[index]) {
        this.stepImages[index] = [];
    }

    const maxImagesPerStep = 5;
    const currentImageCount = this.stepImages[index].length;
    const totalSelectedFiles = files.length;

    // Check if adding the selected files exceeds the maximum allowed images per step
    if (currentImageCount + totalSelectedFiles > maxImagesPerStep) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Limit erreicht',
            detail: `Maximal ${maxImagesPerStep} Bilder pro Schritt erlaubt. Sie haben ${currentImageCount} Bilder und versuchen, ${totalSelectedFiles} hinzuzufügen.`,
        });
        fileUpload.clear();
        return;
    }

    // Notify user about the image processing
    this.messageService.add({
        severity: 'info',
        summary: 'Verarbeitung',
        detail: 'Bilder werden verarbeitet. Bitte warten...',
    });

    const fileProcessingPromises = [];

    // Process each file (up to the available slots limit)
    for (let i = 0; i < totalSelectedFiles; i++) {
        const file = files[i];
        const fileProcessingPromise = this.processFile(file, index);
        fileProcessingPromises.push(fileProcessingPromise);
    }

    try {
        await Promise.all(fileProcessingPromises);
        // Notify the user that the processing is complete
        this.messageService.add({
            severity: 'success',
            summary: 'Fertig',
            detail: 'Bilder erfolgreich hochgeladen und verarbeitet.',
        });
    } catch (error) {
        console.error('Error processing image:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Es gab ein Problem beim Verarbeiten der Bilder.',
        });
        const errorDetails = typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error);

        // Log the error with detailed information
        this.logService.log(
            'Es gab ein Problem beim Verarbeiten der Bilder.',      // Log message
            'ERROR',                         // Log level
            { error: errorDetails },          // Additional data (error details)
            new Date().toISOString(),         // Timestamp
            'currentUserId'                   // User ID (replace with actual user ID if available)
        );
    }

    // Clear the file upload component
    fileUpload.clear();
}

private async processFile(file: File, index: number) {
    const base64 = await this.readFileAsDataURL(file);
    // Compress the image before adding
    const compressedImage = await this.imageCompress.compressFile(base64, -1, 50, 50);

    // Check for duplicate images
    if (this.stepImages[index].includes(compressedImage)) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Duplikat',
            detail: 'Dieses Bild wurde bereits hochgeladen.',
        });
        return;
    }

    // Add compressed image to stepImages
    this.stepImages[index].push(compressedImage);
}

// Helper function to read file as Data URL
private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async handleRecipeImageUpload(event: any) {
  const file = event.files[0];
  if (!file) return;

  // Notify user about the image processing
  this.messageService.add({
      severity: 'info',
      summary: 'Verarbeitung',
      detail: 'Das Rezeptbild wird verarbeitet. Bitte warten...',
  });

  try {
      const base64 = await this.readFileAsDataURL(file);
      // Compress the image before setting it
      const compressedImage = await this.imageCompress.compressFile(base64, -1, 50, 50);

      // Check if the same image is already set
      if (this.recipeImage === compressedImage) {
          this.messageService.add({
              severity: 'warn',
              summary: 'Duplikat',
              detail: 'Dieses Rezeptbild wurde bereits hochgeladen.',
          });
          return;
      }

      // Set the compressed image as the recipe image
      this.recipeImage = compressedImage;

      // Notify the user that the processing is complete
      this.messageService.add({
          severity: 'success',
          summary: 'Fertig',
          detail: 'Rezeptbild erfolgreich hochgeladen und verarbeitet.',
      });
  } catch (error) {
      console.error('Error processing recipe image:', error);
      this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Es gab ein Problem beim Verarbeiten des Rezeptbildes.',
      });
      const errorDetails = typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error);

      // Log the error with detailed information
      this.logService.log(
          'Es gab ein Problem beim Verarbeiten des Rezeptbildes.',      // Log message
          'ERROR',                          // Log level
          { error: errorDetails },          // Additional data (error details)
          new Date().toISOString(),         // Timestamp
          'currentUserId'                   // User ID (replace with actual user ID if available)
      );
  }
}

  removeRecipeImage(): void {
    this.recipeImage = null;
  }
  clearAllUploadedImages(): void {
    this.stepImages = {}
  }

  toggleDiet(value: string) {
    const selectedDiets = this.getSelectedDiets();
    if (this.selectedDiets[value] && selectedDiets.length <= 5) {
      this.selectedDiets[value] = false;
    } else {
      this.selectedDiets[value] = true;
    }
    if (selectedDiets.length == 5) {
      this.selectedDiets[value] = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Limit erreicht',
        detail: 'Sie können maximal 5 Tags auswählen.'
      });
    }
  }

  isCheckboxDisabled(value: string): boolean {
    const selectedDiets = this.getSelectedDiets();
    return selectedDiets.length >= 5 && !this.selectedDiets[value];
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

    recipeData.ingredients = recipeData.ingredients.map((ingredient: any) => {
      // Remove ingredientOptions from the main ingredient
      const { ingredientOptions, ...cleanedIngredient } = ingredient;
  
      return {
          ...cleanedIngredient,
          alternatives: ingredient.alternatives.map((alternative: any) => {
              // Remove ingredientOptions from each alternative
              const { ingredientOptions, ...cleanedAlternative } = alternative;
              return cleanedAlternative;
          }),
      };
  });

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
        setTimeout(() => {
          this.recipeSaved.emit();
      }, 1200);
      },
      (error) => {
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save the recipe.',
        });
        const errorDetails = typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error);
        this.logService.log(
          'Failed to save the recipe.', // Message
          'ERROR',                       // Log level
          { error: errorDetails },      // Additional data (error details)
          new Date().toISOString(),       // timestamp
          'currentUserId'                 // userId (replace with actual user ID if available)
        );
        this.loading = false;
        this.form.enable(); // Re-enable the form
      },
    );
  }
}
