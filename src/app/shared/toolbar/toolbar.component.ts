import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { MatFabButton } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  standalone: true,
  imports: [MatFabButton],
})
export class ToolbarComponent implements OnInit {
  constructor(
    public userService: UserService,
    private route: Router,
  ) {}

  ngOnInit(): void {}

  onClickLogout() {
    this.userService.logout();
  }

  onClickAvatar() {
    this.route.navigate(['/profile']);
  }
}
