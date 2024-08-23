import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { MapComponent } from './components/map/map.component';
import { NearOffersCardComponent } from './components/near-offers-card/near-offers-card.component';
import { OfferService } from '../shared/services/offer.service';
import { SupabaseService } from '../shared/services/supabase.service';
import { PublicRecipeType } from '../shared/types/public-recipe.type';
import { PublicRecipeService } from '../shared/services/public-recipe.service';
import { NgOptimizedImage } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AddressType } from '../shared/types/address.type';
import { OfferType } from '../shared/types/offer.type';
import { MenuplanType } from '../shared/types/menuplan.type';
import { SearchComponent } from './components/search/search.component';
import { DialogModule } from 'primeng/dialog';
import { SeasonCalendarComponent } from "./components/season-calendar/season-calendar/season-calendar.component";
import { StoreService } from '../shared/store/store.service';
import { Subscription } from 'rxjs';
import { RecipeService } from '../shared/services/recipe.service';
import { NewMenuplanService } from '../shared/services/new-menuplan.service';
import { RecipeType} from '../shared/types/recipe.type'
import { filter, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-new-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    MapComponent,
    NearOffersCardComponent,
    NgOptimizedImage,
    NgFor,
    NgIf,
    SearchComponent,
    CardModule,
    ButtonModule,
    DialogModule,
    SeasonCalendarComponent
],
})
export class DashboardComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;
  randomRecipes: PublicRecipeType[] = [];
  companyRecipes: RecipeType[] = [];
  publicRecipes: PublicRecipeType[] = [];
  suggestedRecipes: PublicRecipeType[] = [];
  selectedRecipe: RecipeType | null = null;
  selectedMenu: MenuplanType | null = null;
  offers: OfferType[] = [];
  loaded = false;
  private subscription: Subscription = new Subscription();
  recentMenus: MenuplanType[] = [];
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  searchName: string = '';
  selectedSortOption: string = 'recipeName,asc';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  displayDialog: boolean = false;

  constructor(
    public offerService: OfferService,
    private publicRecipeService: PublicRecipeService,
    private store: StoreService, // Inject StoreService
    private recipeService: RecipeService,
    private menuplanService: NewMenuplanService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanyRecipes();
    this.loadPublicRecipes();
    this.getOffers();
    this.getRecentMenus();
  }

  openRecipeDetails(recipe: RecipeType){
      this.selectedRecipe = recipe; 
      this.displayDialog = true;
      this.cdr.detectChanges();
  }

  openMenuDetails(menu: MenuplanType){
    this.selectedMenu = menu; 
    this.displayDialog = true;
    this.cdr.detectChanges();
}

  loadCompanyRecipes(): void {
    const seasons = this.getSeasonsFromDateRange(this.fromDate, this.toDate);
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null && company.id !== undefined),
        switchMap(company =>
          this.recipeService.getRecipesByCompanyId(
            this.currentPage,
            this.pageSize,
            this.selectedSortOption,
            this.searchName,
            seasons
          )
        )
      )
      .subscribe(
        page => {
          this.companyRecipes = page.content;
          this.totalElements = page.totalElements;
        },
        error => {
          console.error('Error loading company recipes:', error);
        }
      );
  }

  loadPublicRecipes(): void {
    this.publicRecipeService.getRecipes().subscribe(
      (recipes: PublicRecipeType[]) => {
        this.publicRecipes = recipes;
        this.suggestedRecipes = this.getRandom(recipes, 20);
        this.randomRecipes = this.getRandom(recipes, 3);
      },
      error => {
        console.error('Error loading public recipes:', error);
      }
    );
  }

  getSeasonsFromDateRange(fromDate: Date | null, toDate: Date | null): string[] {
    if (!fromDate || !toDate) {
      return [];
    }

    const seasons = [];
    const startMonth = fromDate.getMonth() + 1;
    const endMonth = toDate.getMonth() + 1;

    if ((startMonth <= 2 || startMonth === 12) || (endMonth <= 2 || endMonth === 12)) {
      seasons.push('Winter');
    }
    if ((startMonth <= 5 && startMonth >= 3) || (endMonth <= 5 && endMonth >= 3)) {
      seasons.push('Spring');
    }
    if ((startMonth <= 8 && startMonth >= 6) || (endMonth <= 8 && endMonth >= 6)) {
      seasons.push('Summer');
    }
    if ((startMonth <= 11 && startMonth >= 9) || (endMonth <= 11 && endMonth >= 9)) {
      seasons.push('Autumn');
    }

    return seasons;
  }

  getOffers() {
    this.subscription.add(
      this.store.selectedCompanyContext$.subscribe(company => {
        if (company && company.addresses && company.addresses.length > 0) {
          const addressUrl = company.addresses[0].self;
          this.offerService.getAddress(addressUrl).subscribe((address: AddressType) => {
            const searchRadiusInKM = 50;
            this.offerService.setOffersBySearchRadius(searchRadiusInKM, address);
          });
        }
      })
    );
    
    this.subscription.add(
      this.offerService.offers$.subscribe(offers => {
        this.offers = offers;
      })
    );

    this.offerService.loaded$.subscribe(loaded => {
      this.loaded = loaded;
    });
  }

  getRecentMenus() {
    this.store.selectedCompanyContext$
    .pipe(
      filter(company => company !== null),
      switchMap(company => this.menuplanService.getAllMenuPlans())
    )
    .subscribe(
      menus => {
        this.recentMenus = menus.slice(0, 3); // Get the first 3 menus
      },
      error => {
        console.error('Error loading menus:', error);
      }
    );
  }

  getRandom(arr: PublicRecipeType[], n: number): PublicRecipeType[] {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
      const x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result as PublicRecipeType[];
  }

  navigateToRecipes() {
    this.router.navigate(['/my-recipes']);
  }

  navigateToMenuPlanning() {
    this.router.navigate(['/menu-planning']);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index; // Use item.id if available, otherwise use the index
  }
}