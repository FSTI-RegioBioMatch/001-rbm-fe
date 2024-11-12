import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProductsComponent } from './products/my-products/my-products.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuPlanningComponent } from './menu-planning/menu-planning.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { ShoppingListDetailedComponent } from './menu-planning/shopping-list/shopping-list-detailed/shopping-list-detailed.component';
import { MenuPlansComponent } from './menu-planning/menu-plans/menu-plans.component';
import { RecipieDetailsComponent } from './recipie-details/recipie-details.component';
import { MyMenusComponent } from './menu-planning/my-menus/my-menus.component';
import { ShoppingListOverviewComponent } from './shopping-list-overview/shopping-list-overview.component';
import { ShoppingListDetailsComponent } from './shopping-list-details/shopping-list-details.component';
// import { NewOfferScanComponent } from './new-offer-scan/new-offer-scan.component';
import { RegisterComponent } from './register/register.component';
import { MenuPlanDetailsComponent } from './menu-plan-details/menu-plan-details.component';
import { Dashboard2Component } from './dashboard2/dashboard2.component';
import { PrPiOverviewComponent } from './pr-pi-overview/pr-pi-overview';
import { OffersOverviewComponent } from './offers-overview/offers-overview.component';
import { OrdersComponent } from './orders/orders.component';
import { ShoppinglistToOrderDetailsComponent } from './shoppinglist-to-order-details/shoppinglist-to-order-details.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MatcherComponent } from './matcher/matcher.component';

const routes: Routes = [
  { path: '', component: Dashboard2Component },
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
    component: Dashboard2Component,
  },
  {
    path: 'menu-planning',
    component: MenuPlanningComponent,
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
    path: 'menu-planning/my-menus/details/:id',
    component: MenuPlanDetailsComponent,
  },
  // {
  //   path: 'menu-planning/shopping-list',
  //   component: ShoppingListComponent,
  // },
  {
    path: 'menu-planning/shopping-list',
    component: ShoppingListOverviewComponent,
  },
  { path: 'shopping-list-detail/:id', component: ShoppingListDetailsComponent },
  { path: 'shoppinglist-to-order-details/:id', component: ShoppinglistToOrderDetailsComponent},
  {
    path: 'menu-planning/shopping-list/:id',
    component: ShoppingListDetailedComponent,
  },
  // {
  //   path: 'menu-planning/shopping-list/:id/offer-scan/:scanId',
  //   component: NewOfferScanComponent,
  // },
  {
    path: 'recipe-details/:id',
    component: RecipieDetailsComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'pr-pi-overview', component: PrPiOverviewComponent
  },
  {
    path:  'orders', component: OrdersComponent
  },
  {
    path: 'offers-overview', component: OffersOverviewComponent
  },
  {
    path: 'order-details/:id', component: OrderDetailsComponent
  },
  {
    path: 'my-profile', component: MyProfileComponent
  },{
    path: "matcher", component: MatcherComponent
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
