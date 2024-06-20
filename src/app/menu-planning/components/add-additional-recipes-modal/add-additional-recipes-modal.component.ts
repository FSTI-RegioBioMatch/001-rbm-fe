import { Component, OnInit } from '@angular/core';
import {
  ColumnMode,
  NgxDatatableModule,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { PublicRecipeType } from '../../../shared/types/public-recipe.type';
import { PublicRecipeService } from '../../../shared/services/public-recipe.service';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { StoreService } from '../../../shared/store/store.service';

@Component({
  selector: 'app-add-additional-recipes-modal',
  standalone: true,
  imports: [NgxDatatableModule, MatDivider, MatButton],
  templateUrl: './add-additional-recipes-modal.component.html',
  styleUrl: './add-additional-recipes-modal.component.scss',
})
export class AddAdditionalRecipesModalComponent implements OnInit {
  rows: PublicRecipeType[] = [];
  temp: PublicRecipeType[] = [];
  selected: PublicRecipeType[] = [];

  constructor(
    private publicRecipeService: PublicRecipeService,
    private storeService: StoreService,
  ) {}

  ngOnInit(): void {
    this.publicRecipeService.getRecipes().subscribe((recipes) => {
      this.rows = recipes;
      this.temp = [...recipes];
    });
  }

  onRowSelected({ selected }: any) {
    console.log(selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event: any) {
    console.log('Activate Event', event);
  }

  onClickAddRecipes() {
    this.storeService.selectedPublicRecipe$.subscribe((recipes) => {
      this.storeService.selectedPublicRecipeSubject.next(this.selected);
    });
  }

  protected readonly SelectionType = SelectionType;
  protected readonly ColumnMode = ColumnMode;
}
