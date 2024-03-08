import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { CommunityRecipesComponent } from './community-recipes/community-recipes.component';
import { ForkOrCreateRecipeComponent } from './fork-or-create-recipe/fork-or-create-recipe.component';
import { MyProductsComponent } from './products/my-products/my-products.component';
import { SeasonCalendarComponent } from './season-calendar/season-calendar.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'my-recipes', component: MyRecipesComponent },
  { path: 'com-recipes', component: CommunityRecipesComponent },
  {
    path: 'fork-or-create-recipe/:id',
    component: ForkOrCreateRecipeComponent,
  },
  {
    path: 'products/my-products',
    component: MyProductsComponent,
  },
  {
    path: 'season-calendar',
    component: SeasonCalendarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
