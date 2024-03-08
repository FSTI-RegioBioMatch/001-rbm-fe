import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  KeycloakAngularModule,
  KeycloakBearerInterceptor,
  KeycloakService,
} from 'keycloak-angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import {
  MatButton,
  MatFabAnchor,
  MatFabButton,
} from '@angular/material/button';
import { SideMenuComponent } from './shared/side-menu/side-menu.component';
import { MatIconModule } from '@angular/material/icon';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyRecipesComponent } from './my-recipes/my-recipes.component';
import {
  MatFormField,
  MatHint,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { RecipeSearchToolbarComponent } from './my-recipes/components/recipe-search-toolbar/recipe-search-toolbar.component';
import {
  MatDatepicker,
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { RecipeCardComponent } from './my-recipes/components/recipe-card/recipe-card.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.regiobiomatch.de',
        realm: 'regiobiomatch',
        clientId: 'regiobiomatch-client',
      },
      initOptions: {
        onLoad: 'login-required',
        flow: 'standard',
      },
      loadUserProfileAtStartUp: true,
      // enableBearerInterceptor: true, // attach ACCESS_TOKEN on each request
      // bearerPrefix: 'Bearer', // prefix "bearer <TOKEN> on each request
      bearerExcludedUrls: [],
    });
}

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SideMenuComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KeycloakAngularModule,
    MatFabButton,
    MatButton,
    MatIconModule,
    MatFabAnchor,
    MatFormField,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MyRecipesComponent,
    MatInput,
    MatDivider,
    RecipeSearchToolbarComponent,
    MatDatepicker,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatLabel,
    MatSuffix,
    RecipeCardComponent,
    MatProgressSpinner,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    // provideHttpClient(withInterceptorsFromDi()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
