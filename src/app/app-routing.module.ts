import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProductsComponent } from './products/my-products/my-products.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuPlanningComponent } from './menu-planning/menu-planning.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { MenuPlansComponent } from './menu-plans/menu-plans.component';

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
    path: 'menu-planning/menu-plans',
    component: MenuPlansComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
