import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { UserRequiredActionsType } from '../types/user-required-actions.type';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CompleteUserProfileType } from '../../profile/complete-profile/types/complete-user-profile.type';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _profile!: KeycloakProfile;
  private _userProfileWithActions!: UserRequiredActionsType;
  private _loading = true;
  private _$userProfileWithActions: Observable<UserRequiredActionsType> =
    new Observable<UserRequiredActionsType>();

  get profile(): KeycloakProfile {
    return this._profile;
  }

  get userProfileWithActions(): UserRequiredActionsType {
    return this._userProfileWithActions;
  }

  get userProfileWithActionsAsObservable(): Observable<UserRequiredActionsType> {
    return this._$userProfileWithActions;
  }

  get loading(): boolean {
    return this._loading;
  }

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
    private router: Router,
  ) {}

  init() {
    this._loading = true;
    this.keycloakService.loadUserProfile().then((profile) => {
      this._profile = profile;
      this.sync();
    });
  }

  private sync() {
    return this.http
      .post<UserRequiredActionsType>('/services/masterdata/api/user/sync', {})
      .subscribe((userRequiredActions) => {
        this._userProfileWithActions = userRequiredActions;
        this._$userProfileWithActions = of(userRequiredActions);
        if (userRequiredActions.requiredActions.length > 0) {
          this.router.navigate(['/complete-profile']);
        }

        this._loading = false;
      });
  }

  logout() {
    this.keycloakService.logout('/');
  }
  completeUserProfile(completeUserProfileType: CompleteUserProfileType) {
    return this.http.post(
      '/services/masterdata/api/user/complete-profile',
      completeUserProfileType,
    );
  }
}
