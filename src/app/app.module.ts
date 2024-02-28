import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
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
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import {
  MatOption,
  MatSelect,
  MatSelectTrigger,
} from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';

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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
