import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  MatButton,
  MatFabAnchor,
  MatFabButton,
} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { MatInput } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import {
  MatDatepicker,
  MatDatepickerActions,
  MatDatepickerApply,
  MatDatepickerCancel,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { SideMenuComponent } from './shared/side-menu/side-menu.component';
import { MapComponent } from './dashboard/map/map.component';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.regiobiomatch.de',
        realm: 'regiobiomatch',
        clientId: 'regiobiomatch-client',
      },
      initOptions: {
        onLoad: 'check-sso',
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
    MatFabButton,
    MatButton,
    MatIconModule,
    MatFabAnchor,
    MatFormField,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MatInput,
    MatDivider,
    MatDatepicker,
    MatDatepickerActions,
    MatDatepickerApply,
    MatDatepickerCancel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatLabel,
    MatSuffix,
    MatProgressSpinner,
    MatTabGroup,
    MatTab,
    MatHeaderCell,
    MatTable,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatHeaderCellDef,
    MatCellDef,
    MatColumnDef,
    MatButtonToggleGroup,
    MatButtonToggle,
    ToolbarComponent,
    SideMenuComponent,
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
    provideNativeDateAdapter(),
    provideHttpClient(withInterceptorsFromDi()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
