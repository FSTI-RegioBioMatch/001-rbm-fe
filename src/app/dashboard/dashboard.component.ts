import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { SearchComponent } from './components/search/search.component';
import { DialogModule } from 'primeng/dialog';
import { SeasonCalendarComponent } from "./components/season-calendar/season-calendar/season-calendar.component";
import { StoreService } from '../shared/store/store.service';
import { Subscription } from 'rxjs';


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
  recipes: PublicRecipeType[] = [];
  suggestedRecipes: PublicRecipeType[] = [];
  offers: OfferType[] = [];
  loaded = false;
  private subscription: Subscription = new Subscription();

  constructor(
    public offerService: OfferService,
    private supabaseService: SupabaseService,
    private publicRecipeService: PublicRecipeService,
    private store: StoreService // Inject StoreService
  ) {}

  ngOnInit(): void {
    this.getRecipes();
    this.getOffers();
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }

  openDetails(meal: any) {
    console.log('Meal:', meal);
  }

  getRecipes() {
    this.publicRecipeService.getRecipes().subscribe((recipes) => {
      this.recipes = recipes;
      this.suggestedRecipes = this.getRandom(recipes, 20);
      this.randomRecipes = this.getRandom(recipes, 3);
    });
  }

  getOffers() {
    this.subscription.add(
      this.store.selectedCompanyContext$.subscribe(company => {
        if (company && company.addresses && company.addresses.length > 0) {
          const addressUrl = company.addresses[0].self; // Use the first address
          this.offerService.getAddress(addressUrl).subscribe((address: AddressType) => {
            const searchRadiusInKM = 50; // Adjust the search radius as needed
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

  getFirstImagOfRecipe(recipe: PublicRecipeType): string {
    return '';
  }

  logToConsole(message: string): void {
    console.log(message);
  }

  trackByFn(index: number, item: any): any {
    return item.id; // or item.someUniqueIdentifier
  }

}