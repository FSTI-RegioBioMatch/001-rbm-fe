import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MapComponent } from './map/map.component';
import { NearOffersCardComponent } from './components/near-offers-card/near-offers-card.component';
import { OfferService } from '../shared/services/offer.service';
import { RecepieDetailsDialogComponent } from './recepie-details-dialog/recepie-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SupabaseService } from '../shared/services/supabase.service';
import { PublicRecipeType } from '../shared/types/public-recipe.type';
import { PublicRecipeService } from '../shared/services/public-recipe.service';

@Component({
  selector: 'app-new-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MapComponent,
    NearOffersCardComponent,
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;
  randomRecipes: PublicRecipeType[] = [];
  recipes: PublicRecipeType[] = [];
  suggestedRecipes: PublicRecipeType[] = [];

  constructor(
    private dialog: MatDialog,
    public offerService: OfferService,
    private supabaseService: SupabaseService,
    private publicRecipeService: PublicRecipeService,
  ) {}

  ngOnInit(): void {
    this.getRecepies();
  }

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }

  openDetails(meal: any) {
    this.dialog.open(RecepieDetailsDialogComponent, {
      data: { meal },
    });
  }

  async getRecepies() {
    try {
      const { data, error } = await this.supabaseService.supabaseClient
        .from('recipes')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        this.recipes = data as PublicRecipeType[];
        this.suggestedRecipes = this.getRandom(data as PublicRecipeType[], 20);
        this.randomRecipes = this.getRandom(data as PublicRecipeType[], 3);

        this.publicRecipeService
          .getImagesByImageFolderUUID(this.recipes[0].image_folder)
          .then((links: string[]) => {
            console.log('Links:', links);
          });
      }

      console.log('Recipies:', data);
    } catch (error) {
      console.error('Error fetching recipies:', error);
    }
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
}
