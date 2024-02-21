import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {KeycloakAngularModule, KeycloakService} from "keycloak-angular";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import {MatButton, MatFabButton} from "@angular/material/button";
import { SideMenuComponent } from './shared/side-menu/side-menu.component';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.regiobiomatch.de',
        realm: 'regiobiomatch',
        clientId: 'regiobiomatch-client'
      },
      initOptions: {
        onLoad: "login-required",
        flow: "standard"
      }
    });
}

@NgModule({
  declarations: [AppComponent, ToolbarComponent, SideMenuComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KeycloakAngularModule,
    MatFabButton,
    MatButton,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
