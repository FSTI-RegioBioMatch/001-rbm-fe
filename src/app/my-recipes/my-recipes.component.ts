import { AfterViewInit, Component, OnInit } from '@angular/core';
import { PublicRecipeService } from '../shared/services/public-recipe.service';
import { StoreService } from '../shared/store/store.service';
import { Router } from '@angular/router';
import { PrivateRecipeTableComponent } from './components/private-recipe-table/private-recipe-table.component';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [PrivateRecipeTableComponent],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
})
export class MyRecipesComponent implements OnInit, AfterViewInit {
  constructor(
    private publicRecipeService: PublicRecipeService,
    private store: StoreService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {}

  onClickCreateMenuPlan() {
    console.log('Create Menu Plan');
    // this.store.selectedPublicRecipeSubject.next(this.selected);
    this.router.navigate(['/menu-planning']);
  }
}
