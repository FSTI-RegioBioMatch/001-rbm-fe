import { Component, OnInit } from '@angular/core';
import { UserStoreService } from './shared/store/user.store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'RegioBioMatch';

  constructor(private userService: UserStoreService) {}

  ngOnInit(): void {
    this.userService.initPersonMeInformation();
  }
}
