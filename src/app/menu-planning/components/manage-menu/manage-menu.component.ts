import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddressType } from '../../../shared/types/address.type';
import { StoreService } from '../../../shared/store/store.service';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { PublicRecipeType } from '../../../shared/types/public-recipe.type';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import moment from 'moment';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
  ],
  templateUrl: './manage-menu.component.html',
  styleUrl: './manage-menu.component.scss',
})
export class ManageMenuComponent implements OnInit, AfterViewInit {
  address!: AddressType;
  loading = true;
  recipes!: PublicRecipeType[];
  searchedRecipes: PublicRecipeType[] = [];
  weekNumbers!: number[];
  timeout: any;

  rows: PublicRecipeType[] = [];
  columns = [{ prop: 'img' }, { prop: 'title' }, { name: 'Type' }];
  temp: PublicRecipeType[] = [];

  weekDays = [
    { day: 'Monday', viewDay: 'Montag' },
    { day: 'Tuesday', viewDay: 'Dienstag' },
    { day: 'Wednesday', viewDay: 'Mittwoch' },
    { day: 'Thursday', viewDay: 'Donnerstag' },
    { day: 'Friday', viewDay: 'Freitag' },
    { day: 'Saturday', viewDay: 'Samstag' },
    { day: 'Sunday', viewDay: 'Sonntag' },
  ];

  searchForm = new FormGroup({
    search: new FormControl(''),
  });

  get search() {
    return this.searchForm.get('search') as FormControl;
  }

  constructor(
    private store: StoreService,
    private supabaseService: SupabaseService,
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.weekNumbers = this.getWeekNumbersFromCurrentWeek();

    this.recipesBasedOnLocalOffers();
    this.getPublicRecipes();

    this.onSearchValueChangedListener();
  }

  recipesBasedOnLocalOffers() {
    this.store.offerOntoFood$.subscribe((ontoFoodTypes) => {
      const localOffers: Set<string> = new Set(
        ontoFoodTypes.map((type) => type.label as string),
      );
    });
  }

  getPublicRecipes() {
    this.supabaseService.supabaseClient
      .from('recipes')
      .select('*')
      .then((response) => {
        if (response.data) {
          this.recipes = response.data as PublicRecipeType[];
          this.rows = response.data as PublicRecipeType[];

          console.log(this.recipes);
        }
      });
  }

  onSearchValueChangedListener() {
    this.search.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      console.log('value', value);
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
}
