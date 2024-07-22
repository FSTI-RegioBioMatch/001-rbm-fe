import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';

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
    CheckboxModule
  ]
})
export class NewRecepieDialogComponent {
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

  form: FormGroup;
  stepImages: { [key: number]: string[] } = {};  // Store image URLs for each step
  showNote: { [key: number]: boolean } = {};  // Track visibility of note fields

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      steps: this.fb.array([
        this.createStep()
      ]),
      ingredients: this.fb.array([
        this.createIngredient()
      ]),
      energie: [''],
      portionen: [''],
      besonderheiten: [''],
      essensgaeste: [''],
      allergene: [''],
      saison: ['']
    });
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
      anleitung: ['', Validators.required]
    });
  }

  addStep() {
    this.steps.push(this.createStep());
  }

  createIngredient(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      unit: ['', Validators.required],
      optional: [false],
      alternatives: this.fb.array([]), // Array to hold alternative ingredients
      note: [''] // Note field
    });
  }

  addIngredient() {
    this.ingredients.push(this.createIngredient());
  }

  createAlternative(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      unit: ['', Validators.required]
    });
  }

  addAlternativeIngredient(index: number) {
    const alternatives = this.getAlternatives(index);
    alternatives.push(this.createAlternative());
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
}
