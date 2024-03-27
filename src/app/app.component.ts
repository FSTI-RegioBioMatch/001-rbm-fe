import { Component, OnInit } from '@angular/core';
import { UserService } from './shared/services/user.service';
import { CompanyService } from './shared/services/company.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = '001-rbm-dashboard-fe';

  constructor(public userService: UserService) {}

  ngOnInit(): void {
    this.userService.init();
  }
}
