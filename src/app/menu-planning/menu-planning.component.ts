import { Component, OnInit } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';
import { StoreService } from '../shared/store/store.service';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import moment from 'moment/moment';
import {
  ColumnMode,
  NgxDatatableModule,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { PublicRecipeType } from '../shared/types/public-recipe.type';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { AddAdditionalRecipesModalComponent } from './components/add-additional-recipes-modal/add-additional-recipes-modal.component';

@Component({
  selector: 'app-menu-planning',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    ManageMenuComponent,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgxDatatableModule,
    MatCard,
    MatCardContent,
    MatButton,
    MatDivider,
  ],
  templateUrl: './menu-planning.component.html',
  styleUrl: './menu-planning.component.scss',
})
export class MenuPlanningComponent implements OnInit {
  rows: PublicRecipeType[] = [];
  weekNumbers!: number[];
  selected: PublicRecipeType[] = [];

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
    private matDialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.weekNumbers = this.getWeekNumbersFromCurrentWeek();

    this.store.selectedPublicRecipe$.subscribe((recipes) => {
      console.log('stored recipes', recipes);
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

  openAddAdditionalRecipesModal() {
    this.matDialog.open(AddAdditionalRecipesModalComponent, {
      width: '800px',
    });
  }

  protected readonly SelectionType = SelectionType;
  protected readonly ColumnMode = ColumnMode;
}
