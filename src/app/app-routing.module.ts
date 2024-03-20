import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import { CommunityRecipesComponent } from './community-recipes/community-recipes.component';
import { ForkOrCreateRecipeComponent } from './fork-or-create-recipe/fork-or-create-recipe.component';
import { MyProductsComponent } from './products/my-products/my-products.component';
import { SeasonCalendarComponent } from './season-calendar/season-calendar.component';
import { CompleteProfileComponent } from './profile/complete-profile/complete-profile.component';
import { MyProfileComponent } from './profile/my-profile/my-profile.component';
import { ProfileCompaniesComponent } from './profile/my-profile/components/profile-companies/profile-companies.component';

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
  {
    path: 'complete-profile',
    component: CompleteProfileComponent,
  },
  {
    path: 'profile',
    component: MyProfileComponent,
  },
  {
    path: 'profile/companies',
    component: ProfileCompaniesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
