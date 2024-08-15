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
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;
  randomRecipes: PublicRecipeType[] = [];
  recipes: PublicRecipeType[] = [];
  suggestedRecipes: PublicRecipeType[] = [];
  offers: OfferType[] = [];
  loaded = false;

  constructor(
    public offerService: OfferService,
    private supabaseService: SupabaseService,
    private publicRecipeService: PublicRecipeService,
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
    const address: AddressType = { 
        id: "addr-123456",
        city: "Berlin",
        lat: 52.520008,
        links: {
          self: "https://api.example.com/addresses/addr-123456",
          update: "https://api.example.com/addresses/addr-123456/update",
          remove: "https://api.example.com/addresses/addr-123456/remove",
          company: "https://api.example.com/companies/comp-789012"
        },
        lon: 13.404954,
        street: "Unter den Linden",
        name: "Brandenburg Gate",
        suffix: "Mitte",
        zipcode: "10117",
        type: "landmark" 
    }; // Example address
    const searchRadiusInKM = 50; // Example search radius

    console.log('Initiating search with radius:', searchRadiusInKM, 'and address:', address);
    this.offerService.setOffersBySearchRadius(searchRadiusInKM, address);

    this.offerService.offers$.subscribe(offers => {
      console.log('Received offers:', offers);
      this.offers = offers;
    });

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

    console.log('Random:', result);

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