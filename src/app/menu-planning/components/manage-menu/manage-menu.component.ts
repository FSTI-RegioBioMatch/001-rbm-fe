import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { RbmInputComponent } from '../../../shared/components/ui/rbm-input/rbm-input.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { AddressType } from '../../../shared/types/address.type';
import { StoreService } from '../../../shared/store/store.service';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { PublicRecipeType } from '../../../shared/types/public-recipe.type';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [
    MatInput,
    MatFormField,
    MatLabel,
    RbmInputComponent,
    ReactiveFormsModule,
    RecipeCardComponent,
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

  searchForm: FormGroup;

  get search() {
    return this.searchForm.get('search') as FormControl;
  }

  constructor(
    private store: StoreService,
    private supabaseService: SupabaseService,
  ) {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  ngAfterViewInit(): void {
    this.onSearchFieldChange();
  }

  ngOnInit(): void {
    this.recipesBasedOnLocalOffers();
    this.getPublicRecipes();
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
          console.log(this.recipes);
        }
      });
  }

  private onSearchFieldChange() {
    this.search.valueChanges.subscribe((value) => {
      if (value) {
        console.log(value);
        this.searchedRecipes = this.recipes.filter((recipe) =>
          recipe.title.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        this.searchedRecipes = [];
      }
    });
  }
}
