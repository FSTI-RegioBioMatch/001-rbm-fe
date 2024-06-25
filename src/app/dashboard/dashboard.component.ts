import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from './map/map.component';
import { NearOffersCardComponent } from './components/near-offers-card/near-offers-card.component';
import { OfferService } from '../shared/services/offer.service';
import { SupabaseService } from '../shared/services/supabase.service';
import { PublicRecipeType } from '../shared/types/public-recipe.type';
import { PublicRecipeService } from '../shared/services/public-recipe.service';
import { NgOptimizedImage } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-new-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    MapComponent,
    NearOffersCardComponent,
    NgOptimizedImage,
    CardModule,
    Button,
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;
  randomRecipes: PublicRecipeType[] = [];
  recipes: PublicRecipeType[] = [];
  suggestedRecipes: PublicRecipeType[] = [];

  constructor(
    public offerService: OfferService,
    private supabaseService: SupabaseService,
    private publicRecipeService: PublicRecipeService,
  ) {}

  ngOnInit(): void {
    this.getRecipes();
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
}
