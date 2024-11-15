import { Component, OnInit, NgZone } from '@angular/core';
import Fuse from 'fuse.js';
import { AddressType } from '../shared/types/address.type';
import { filter, of, switchMap, take } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StoreService } from '../shared/store/store.service';
import { NewOfferService } from '../shared/services/new-offer.service';
import { MatcherService } from '../matcher.service';
import { LocalizeService } from '../shared/services/localize.service';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { RecipeService } from '../shared/services/recipe.service';

@Component({
  selector: 'app-matcher',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    PaginatorModule,
    DialogModule
  ],
  templateUrl: './matcher.component.html',
  styleUrl: './matcher.component.scss',
  providers: [MessageService]
})
export class MatcherComponent implements OnInit {

  displayModal: boolean = false;
  selectedRecipe: any = null;
  totalRecords: number = 0;
  currentPage: number = 0;
  pageSize: number = 6; // Anzahl der Rezepte pro Seite
  paginatedRecipeMatches: any[] = [];

  loading = false;
  offers: any[] = []; 
  range: number = 50; 
  recipes: any[] = [];
  ontofood: any;
  recipeMatches: any[] = [];
  clickedMatches: Set<any> = new Set();

  constructor(
    private offerService: NewOfferService,
    private store: StoreService,
    private messageService: MessageService,
    private router: Router,
    private matcherService: MatcherService,
    private localizationService: LocalizeService,
    private ngZone: NgZone, // Inject NgZone for better control
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.loading = true; // Start loading
    this.fetchAllRecipes();
    this.loadOffers();
    this.loadOfferLocalize();
  }

  showRecipeDetails(recipe: any) {
    this.selectedRecipe = recipe;
    this.displayModal = true;
  }

  hideRecipeDetails() {
    this.displayModal = false;
    this.selectedRecipe = null;
  }

  private loadOffers(): void {
    const address = this.offerService.getAddress();

    if (address) {
      this.fetchOffers(address);
    } else {
      this.store.selectedCompanyContext$
        .pipe(
          filter(company => company !== null),
          switchMap(company => {
            if (company && company.addresses && company.addresses.length > 0) {
              const addressUrl = company.addresses[0].self;
              return this.offerService.getAddressFromUrl(addressUrl);
            } else {
              return of(null);
            }
          }),
          take(1)
        )
        .subscribe({
          next: (address: AddressType | null) => {
            if (address) {
              this.offerService.setAddress(address);
              this.fetchOffers(address);
            } else {
              this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Adresse konnte nicht gefunden werden'});
              this.loading = false;
            }
          },
          error: err => {
            this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Adresse konnte nicht geladen werden'});
            console.error('Error loading address:', err);
            this.loading = false;
          }
        });
    }
  }

  private fetchOffers(address: AddressType): void {
    this.offerService.setOffersBySearchRadius(this.range, address)
      .pipe(take(1))
      .subscribe({
        next: offers => {
          this.offers = offers;
          this.addLocalizedField(); 
        },
        error: error => {
          console.error('Error loading offers:', error);
          this.messageService.add({severity: 'error', summary: 'Fehler', detail: 'Angebote konnten nicht geladen werden'})
          this.loading = false; 
        }
      });
  }

  async fetchAllRecipes() {
    try {
      this.recipes = await this.matcherService.getAllRecipes();
    } catch (error) {
      console.error('Error fetching recipes:', error);
      this.loading = false;
    }
  }

  loadOfferLocalize() {
    this.localizationService.getOntofood().subscribe({
      next: (data) => {
        this.ontofood = data;
      },
      error: err => {
        console.error('Error loading localization data:', err);
        this.loading = false;
      }
    });
  }

  private async addLocalizedField(): Promise<void> {
    if (!this.ontofood) {
      console.warn('Ontofood translations not loaded');
      this.loading = false;
      return;
    }

    const localizedOffers = await Promise.all(
      this.offers.map(async offer => {
        const { ontoFoodType } = offer;
        const translation = ontoFoodType && this.ontofood[ontoFoodType.label];
        
        offer.localized = translation || ontoFoodType.label;
        return offer;
      })
    );

    // Perform matching asynchronously to prevent blocking
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.matchRecipesToOffers(localizedOffers);
        });
      }, 0);
    });
  }

  private matchRecipesToOffers(localizedOffers: any[]): void {
    // Configure Fuse.js for broad matching with fuzzy search
    const fuse = new Fuse(localizedOffers, {
      keys: ['localized'], // Search in the 'localized' field
      threshold: 0.3, // Adjust threshold for matching tolerance
      includeScore: true, // Optional: include score for better matching insights
    });
  
    // Find best matches for each recipe
    this.recipeMatches = this.recipes.map(recipe => {
      const totalIngredients = recipe.ingredients.length;
      let matchedCount = 0;
  
      // Enhance each ingredient with match information
      const ingredientsWithMatch = recipe.ingredients.map((ingredient: { name: string; quantity: string; }, index: number) => {
        const result = fuse.search(ingredient.name);
        const isMatched = result.length > 0;
        const matchedOffers = isMatched ? result.map(r => r.item) : [];
  
        if (isMatched) {
          matchedCount += 1;
        }
  
        return {
          ...ingredient,
          isMatched,
          matchedOffers, // Optionally, include matched offers for further details
        };
      });
  
      const matchPercentage = (matchedCount / totalIngredients) * 100;
  
      return {
        recipe,
        matchPercentage,
        ingredients: ingredientsWithMatch, // Use enhanced ingredients
      };
    });

    this.recipeMatches = this.recipeMatches.filter(match => match.matchPercentage > 0);
  
    // Sort recipes by highest match percentage
    this.recipeMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  
    // Log for debugging
    console.log('Best Recipe Matches:', this.recipeMatches);

    this.totalRecords = this.recipeMatches.length;
    this.paginate({ first: 0, rows: this.pageSize });
    this.loading = false; // Stop loading after matching is done
  }

  paginate(event: any) {
    this.currentPage = event.first / event.rows;
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRecipeMatches = this.recipeMatches.slice(start, end);
  }

  getImageUrl(recipe: any): string {
    return recipe.image_urls && recipe.image_urls.length > 0 ? recipe.image_urls[0] : 'assets/default-image.jpg'; // Update path as needed
  }

  /**
   * Checks if an ingredient is matched in the offers.
   * @param ingredientName - The name of the ingredient.
   * @param matchedOffers - The list of matched offers.
   * @returns True if matched, else false.
   */
  isIngredientMatched(ingredientName: string, matchedOffers: any[]): boolean {
    if (!matchedOffers || matchedOffers.length === 0) {
      return false;
    }
    // Normalize the ingredient name and offer localization for comparison
    const normalizedIngredient = ingredientName.toLowerCase().trim();
    return matchedOffers.some(offer => offer.localized.toLowerCase().trim() === normalizedIngredient);
  }


  createNewRecipeFromMatch(match: any) {
    if (!match || !match.recipe) {
      console.error('Invalid match object:', match);
      return;
    }

    this.clickedMatches.add(match);

    // Dings neues rezept macchen und an recipesercviece schicken
    const newRecipe = {
      recipeName: match.recipe.title || 'Untitled Recipe',
      recipeDescription: match.recipe.instructions || '',
      ingredients: match.ingredients.map((ingredient: any) => {
        const matchedOffer = ingredient.matchedOffers && ingredient.matchedOffers.length > 0 ? ingredient.matchedOffers[0] : null;
        const name = matchedOffer && matchedOffer.ontoFoodType ? matchedOffer.ontoFoodType.label : 'Unknown Ingredient';
        return {
          name: name,
          amount: ingredient.quantity || 'N/A',
          unit: '', // You might need to adjust this based on your data
          optional: false,
          note: '',
          alternatives: [],
        };
      }),
      steps: match.recipe.steps || [],
      energie: '',
      portionen: match.recipe.portions || 1,
      besonderheiten: '',
      essensgaeste: [],
      allergene: [],
      saison: '',
      selectedDiets: {},
      recipeImage: match.recipe.image_urls && match.recipe.image_urls.length > 0 ? match.recipe.image_urls[0] : null,
    };

    // Send the new recipe to the backend using RecipeService
    this.sendRecipeToBackend(newRecipe);
  }

  sendRecipeToBackend(recipe: any) {
    this.loading = true;
    this.recipeService.saveRecipe(recipe).subscribe(
      (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Rezept erfolgreich erstellt!',
        });
        this.loading = false;
      },
      (error) => {
        console.error('Error creating recipe:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: 'Rezept konnte nicht erstellt werden.',
        });
        this.loading = false;
      }
    );
  }
}
