import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { ButtonType } from './types/button.type';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent implements OnInit, AfterViewInit {
  private route = inject(Router);
  private routers = inject(ActivatedRoute);

  buttons: ButtonType[] = [
    {
      id: 1,
      name: 'Dashboard',
      badgeCounter: 3,
      icon: 'dashboard',
      isActivated: false,
      route: '/',
    },
    {
      id: 2,
      name: 'My Recipes',
      icon: 'restaurant_menu',
      isActivated: false,
      route: '/my-recipes',
    },
  ];

  onClickActivateButton(button: ButtonType) {
    // set all button isActivated = false to ensure only one iteration
    this.buttons.map((button) => {
      button.isActivated = false;
    });

    button.isActivated = true;
    this.route.navigateByUrl(button.route).then(() => {
      console.log(this.route.url);
    });
  }

  ngOnInit(): void {
    const currentPath = this.route.url;
    console.log(currentPath);
    this.buttons.forEach((button) => {
      button.isActivated = currentPath === button.route;
    });
  }

  ngAfterViewInit(): void {}
}
