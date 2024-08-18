import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { MapComponent } from './dashboard/components/map/map.component';
import { currentCompanyInterceptor } from './shared/interceptors/current-company.interceptor';
import { DialogService } from 'primeng/dynamicdialog';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.staging.nearbuy-food.de',
        realm: 'nearbuy',
        clientId: 'regiobiomatch-client',
      },
      initOptions: {
        onLoad: 'login-required',
        flow: 'standard',
      },
      loadUserProfileAtStartUp: true,
      // enableBearerInterceptor: true, // attach ACCESS_TOKEN on each request
      // bearerPrefix: 'Bearer', // prefix "bearer <TOKEN> on each request
      bearerExcludedUrls: [
        'https://www.themealdb.com/*',
        'https://themealdb.com/*',
      ],
    });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KeycloakAngularModule,
    ReactiveFormsModule,
    ToolbarComponent,
    MapComponent,
  ],
  providers: [
    // TODO uncomment to enable Keycloak
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([currentCompanyInterceptor]),
      withFetch(),
    ),
    DialogService,
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
