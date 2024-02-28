import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButton, MatFabButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import {
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { MatInput, MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-recipe-search-toolbar',
  standalone: true,
  imports: [
    MatIcon,
    MatFabButton,
    RouterLink,
    MatFormField,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerActions,
    MatButton,
    MatDatepickerCancel,
    MatDatepickerApply,
    MatLabel,
    MatSelectTrigger,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './recipe-search-toolbar.component.html',
  styleUrl: './recipe-search-toolbar.component.scss',
})
export class RecipeSearchToolbarComponent {
  sortByArr = [
    {
      icon: '',
      name: 'Aufsteigend sortieren',
    },
    {
      icon: '',
      name: 'Absteigend sortieren',
    },
    {
      icon: '',
      name: 'Traditionell',
    },
    {
      icon: '',
      name: 'Laktosefrei',
    },
    {
      icon: '',
      name: 'Glutenfrei',
    },
    {
      icon: '',
      name: 'Vegan',
    },
    {
      icon: '',
      name: 'Vegetarisch',
    },
    {
      icon: '',
      name: 'Filter löschen',
    },
  ];

  form: FormGroup;

  get filter() {
    return this.form.get('filter') as FormControl;
  }

  constructor() {
    this.form = new FormGroup<any>({
      filter: new FormControl(),
    });
  }
}
