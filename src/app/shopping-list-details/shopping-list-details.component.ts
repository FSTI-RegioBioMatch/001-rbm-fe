import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { filter, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { NewShoppingListService } from '../shared/services/new-shopping-list.service';
import { OfferService } from '../shared/services/offer.service';
import { StoreService } from '../shared/store/store.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-shopping-list-details',
  templateUrl: './shopping-list-details.component.html',
  styleUrls: ['./shopping-list-details.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    AccordionModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  standalone: true
})
export class ShoppingListDetailsComponent implements OnInit {
  shoppingList: any;
  ingredientNames: string[] = [];
  offers: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private shoppingListService: NewShoppingListService,
    private offerService: OfferService,
    private storeService: StoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadShoppingList(id);
      } else {
        this.errorMessage = 'No shopping list ID provided';
        this.loading = false;
      }
    });
  }

  private loadShoppingList(id: string): void {
    this.storeService.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(company => this.shoppingListService.getShoppingListById(id))
      )
      .subscribe({
        next: list => {
          this.shoppingList = list;
          this.ingredientNames = Object.keys(this.shoppingList.groupedShoppingList);
          this.loadOffers();
          this.loading = false;
        },
        error: error => {
          console.error('Shopping list not found:', error);
          this.errorMessage = 'Shopping list not found';
          this.loading = false;
        }
      });
  }

  private loadOffers(): void {
    if (this.shoppingList && this.shoppingList.groupedShoppingList) {
      const ingredientNames = this.ingredientNames;

      this.offerService.setOffersBySearchRadius(50, this.offerService.address); // Setting initial search radius and address
      
      this.offerService.offers$.subscribe({
        next: offers => {
          this.offers = offers.filter(offer =>
            offer.ontoFoodType?.label && ingredientNames.includes(offer.ontoFoodType.label)
          );
        },
        error: error => {
          console.error('Error loading offers:', error);
          this.errorMessage = 'Error loading offers';
        }
      });
    }
  }

  getOfferForIngredient(ingredientName: string): any[] {
    return this.offers.filter(offer => offer.ontoFoodType?.label === ingredientName);
  }

  onClickGoToOffer() {
    const scanId = uuidv4();
    this.router.navigate([`/menu-planning/shopping-list/${this.shoppingList.id}/offer-scan/${scanId}`]);
  }
}
