import { Component, OnInit } from '@angular/core';
import { ManageMenuComponent } from './components/manage-menu/manage-menu.component';
import { StoreService } from '../shared/store/store.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment/moment';
import { MenuplanService } from '../shared/services/menuplan.service';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { JsonPipe } from '@angular/common';
import { RecipeService } from '../shared/services/recipe.service';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { filter, switchMap } from 'rxjs';

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
    FloatLabelModule,
    DropdownModule,
    InputTextareaModule,
    CommonModule,
    ButtonModule,
  ],
  templateUrl: './menu-planning.component.html',
  styleUrls: ['./menu-planning.component.scss'],
})
export class MenuPlanningComponent implements OnInit {
  myRecipes: any[] = []; //contains found recipes
  filteredRecipes: any[] = []; //contains filtered recipes for search
  menuPlan: any[] = []; //stores selected recipes
  menuPlanForm: FormGroup; //form for creating a new menu plan
  searchQuery: string = '';

  weekDays = [
    { label: 'Montag', value: 'Montag' },
    { label: 'Dienstag', value: 'Dienstag' },
    { label: 'Mittwoch', value: 'Mittwoch' },
    { label: 'Donnerstag', value: 'Donnerstag' },
    { label: 'Freitag', value: 'Freitag' },
    { label: 'Samstag', value: 'Samstag' },
    { label: 'Sonntag', value: 'Sonntag' },
  ];

  nextExecutionOptions: any[] = [];
  repeatOptions = [
    { label: 'Täglich', value: 'Täglich' },
    { label: 'Wöchentlich', value: 'Wöchentlich' },
    { label: 'Monatlich', value: 'Monatlich' },
    { label: 'Jährlich', value: 'Jährlich' },
  ];

  constructor(
    private store: StoreService,
    private menuplanService: MenuplanService,
    private recipeService: RecipeService,
  ) {
    this.menuPlanForm = new FormGroup({
      name: new FormControl('', Validators.required),
      nachsteAusfuhrung: new FormControl('', Validators.required),
      wochentag: new FormControl('', Validators.required),
      wiederholung: new FormControl('', Validators.required),
      ort: new FormControl('', Validators.required),
      portions: new FormControl('', Validators.required),
      portionsVegetarisch: new FormControl(''),
      portionsVegan: new FormControl(''),
      description: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.calculateNextExecutionOptions();

    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company =>
          this.recipeService.getRecipesByCompanyId(0, 10, 'recipeName,asc')
        )
      )
      .subscribe(
        page => {
          this.myRecipes = page.content;
          this.filteredRecipes = this.myRecipes;
          console.log('recipes', this.myRecipes);
        },
        error => {
          console.error('Error fetching recipes:', error);
        }
      );
  }

  calculateNextExecutionOptions(): void {
    const today = moment();
    const currentWeek = today.isoWeek();
    const currentYear = today.year();

    for (let i = 0; i < 52; i++) {
      const week = currentWeek + i;
      const weekYear = week > 52 ? currentYear + 1 : currentYear;
      const displayWeek = week > 52 ? week - 52 : week;

      const weekLabel = `KW${displayWeek} ${weekYear}`;
      this.nextExecutionOptions.push({ label: weekLabel, value: weekLabel });
    }
  }

  filterRecipes(): void {
    this.filteredRecipes = this.myRecipes.filter(recipe =>
      recipe.recipeName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addRecipeToMenuPlan(recipe: any): void {
    if (this.menuPlan.includes(recipe)) {
      return;
    }
    this.menuPlan.push(recipe);
    console.log('menuPlan', this.menuPlan);
  }

  removeRecipeFromMenuPlan(recipe: any): void {
    const index = this.menuPlan.indexOf(recipe);
    if (index > -1) {
      this.menuPlan.splice(index, 1);
      console.log('menuPlan', this.menuPlan);
    }
  }

  saveMenuPlan(): void {
    const menuPlanData = {
      ...this.menuPlanForm.value,
      recipes: this.menuPlan
    };
    console.log('Menu Plan Data:', menuPlanData);
  }
}
