import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProductsComponent } from './products/my-products/my-products.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuPlanningComponent } from './menu-planning/menu-planning.component';
import { NewRecepieDialogComponent } from './new-recepie-dialog/new-recepie-dialog.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { ShoppingListComponent } from './menu-planning/shopping-list/shopping-list.component';
import { ShoppingListDetailedComponent } from './menu-planning/shopping-list/shopping-list-detailed/shopping-list-detailed.component';
import { OfferScanComponent } from './menu-planning/shopping-list/offer-scan/offer-scan.component';
import { MenuPlansComponent } from './menu-planning/menu-plans/menu-plans.component';
import { RecipieDetailsComponent } from './recipie-details/recipie-details.component';
import { MyMenusComponent } from './menu-planning/my-menus/my-menus.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'my-recipes',
    component: MyRecipesComponent,
  },
  {
    path: 'products/my-products',
    component: MyProductsComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'menu-planning',
    component: MenuPlanningComponent,
  },
  {
    path: 'add-recipe',
    component: NewRecepieDialogComponent,
  },
  {
    path: 'menu-planning/menu-plans',
    component: MenuPlansComponent,
  },
  {
    path: 'menu-planning/my-menus',
    component: MyMenusComponent,
  },
  {
    path: 'menu-planning/shopping-list',
    component: ShoppingListComponent,
  },
  {
    path: 'menu-planning/shopping-list/:id',
    component: ShoppingListDetailedComponent,
  },
  {
    path: 'menu-planning/shopping-list/:id/offer-scan/:scanId',
    component: OfferScanComponent,
  },
  {
    path: 'recipe-details/:id',
    component: RecipieDetailsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
