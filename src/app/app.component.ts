import { Component, OnInit } from '@angular/core';
import { UserService } from './shared/services/user.service';
import { CompanyService } from './shared/services/company.service';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'RegioBioMatch';

  constructor(
    public userService: UserService,
    public keycloakService: KeycloakService,
  ) {}

  ngOnInit(): void {
    if (this.keycloakService.isLoggedIn()) {
    }
    this.userService.init();
  }
}
