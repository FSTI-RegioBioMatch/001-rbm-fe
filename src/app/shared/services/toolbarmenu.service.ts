import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarMenuService {
  private burgerMenuState = new BehaviorSubject<boolean>(true); // Initialzustand auf true setzen
  burgerMenuState$ = this.burgerMenuState.asObservable();

  setBurgerMenuState(state: boolean) {
    this.burgerMenuState.next(state);
  }
}