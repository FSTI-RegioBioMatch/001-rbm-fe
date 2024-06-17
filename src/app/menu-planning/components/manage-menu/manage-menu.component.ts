import { Component, OnInit } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { RbmInputComponent } from '../../../shared/components/ui/rbm-input/rbm-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { AddressType } from '../../../shared/types/address.type';
import { StoreService } from '../../../shared/store/store.service';

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
  ],
  templateUrl: './manage-menu.component.html',
  styleUrl: './manage-menu.component.scss',
})
export class ManageMenuComponent implements OnInit {
  address!: AddressType;
  loading = true;

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.recipesBasedOnLocalOffers();
  }

  recipesBasedOnLocalOffers() {
    this.store.offerOntoFood$.subscribe((ontoFoodTypes) => {
      const localOffers: Set<string> = new Set(
        ontoFoodTypes.map((type) => type.label as string),
      );
    });
  }
}
