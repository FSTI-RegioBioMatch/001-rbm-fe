import { Component, OnInit } from '@angular/core';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';
import { StoreService } from '../shared/store/store.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import moment from 'moment/moment';
import { RecipeType } from '../shared/types/recipe.type';
import { MenuplanService } from '../shared/services/menuplan.service';
import { MenuplanType } from '../shared/types/menuplan.type';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { JsonPipe } from '@angular/common';
import { RecipeService } from '../shared/services/recipe.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-menu-planning',
  standalone: true,
  imports: [
    ManageMenuComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TableModule,
    JsonPipe,
    InputTextModule,
  ],
  templateUrl: './menu-planning.component.html',
  styleUrl: './menu-planning.component.scss',
})
export class MenuPlanningComponent implements OnInit {
  rows: RecipeType[] = [];
  weekNumbers!: number[];
  selected: RecipeType[] = [];

  menuPlanFormGroup: FormGroup;

  weekDays = [
    { day: 'Monday', viewDay: 'Montag' },
    { day: 'Tuesday', viewDay: 'Dienstag' },
    { day: 'Wednesday', viewDay: 'Mittwoch' },
    { day: 'Thursday', viewDay: 'Donnerstag' },
    { day: 'Friday', viewDay: 'Freitag' },
    { day: 'Saturday', viewDay: 'Samstag' },
    { day: 'Sunday', viewDay: 'Sonntag' },
  ];

  constructor(
    private store: StoreService,
    private menuplanService: MenuplanService,
    private recipeService: RecipeService,
  ) {
    this.menuPlanFormGroup = new FormGroup({
      menuName: new FormControl(''),
      description: new FormControl(''),
      weekDay: new FormControl(''),
      executionWeekNumber: new FormControl(''),
      place: new FormControl(''),
      portions: new FormControl('', [
        Validators.min(1),
        Validators.max(9999),
        Validators.pattern(/^\d+$/),
      ]),
    });
  }

  get menuName() {
    return this.menuPlanFormGroup.get('menuName') as FormControl;
  }

  get description() {
    return this.menuPlanFormGroup.get('description') as FormControl;
  }

  get weekDay() {
    return this.menuPlanFormGroup.get('weekDay') as FormControl;
  }

  get executionWeekNumber() {
    return this.menuPlanFormGroup.get('executionWeekNumber') as FormControl;
  }

  get place() {
    return this.menuPlanFormGroup.get('place') as FormControl;
  }

  get portions() {
    return this.menuPlanFormGroup.get('portions') as FormControl;
  }

  ngOnInit(): void {
    this.weekNumbers = this.getWeekNumbersFromCurrentWeek();

    // this.store.selectedRecipes$.subscribe((recipes) => {
    //   console.log('stored recipes', recipes);
    //   this.rows = recipes;
    // });

    this.recipeService.getRecipesByCompanyContext().subscribe((recipes) => {
      console.log('recipes', recipes);
      this.rows = recipes;
    });
  }

  getWeekNumbersFromCurrentWeek(): number[] {
    const currentWeek = moment().isoWeek();
    const currentYear = moment().year();
    const lastWeekOfYear = moment().endOf('year').subtract(2, 'day').isoWeek();
    console.log(564456, moment().endOf('year').subtract(2, 'day').isoWeek());
    // const lastWeekOfYear = 53;
    const weekNumbers: number[] = [];

    console.log('currentWeek', currentWeek);
    console.log('currentYear', currentYear);
    console.log('lastWeekOfYear', lastWeekOfYear);

    for (let week = currentWeek; week <= lastWeekOfYear; week++) {
      weekNumbers.push(week);
    }

    // Handle the case where the year has 53 weeks and the last week overlaps with week 1 of the next year
    if (
      lastWeekOfYear === 53 &&
      moment(`${currentYear}-12-31`).isoWeek() === 1
    ) {
      weekNumbers.push(1);
    }

    console.log('weekNumbers', weekNumbers);

    return weekNumbers;
  }

  onRowSelected({ selected }: any) {
    console.log(selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event: any) {
    console.log('Activate Event', event);
  }

  openAddAdditionalRecipesModal() {}

  onClickCreateMenuPlan() {
    if (!this.menuPlanFormGroup.valid) {
      console.log('Form is not valid');
      return;
    }

    const menuPlan: MenuplanType = {
      description: this.description.value,
      menuName: this.menuName.value,
      weekDay: this.weekDay.value,
      executionWeekNumber: this.executionWeekNumber.value,
      place: this.place.value,
      portions: this.portions.value,
      recipes: this.rows,
    };

    console.log(this.menuPlanFormGroup, menuPlan);

    this.menuplanService.createMenuPlan(menuPlan).subscribe((response) => {
      console.log('Menu plan created');
      console.log('response', response);
    });
  }
}
