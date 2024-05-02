import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { UserRequiredActionsType } from '../types/user-required-actions.type';
import { Router } from '@angular/router';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { CompleteUserProfileType } from '../../profile/complete-profile/types/complete-user-profile.type';
import { CompanyService } from './company.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _profile!: KeycloakProfile;
  private _userProfileWithActions!: UserRequiredActionsType;
  private _loading = true;
  private _$userProfileWithActions: Observable<UserRequiredActionsType> =
    new Observable<UserRequiredActionsType>();
  private _isLockDashboard = false;

  get isLockDashboard(): boolean {
    return this._isLockDashboard;
  }

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
    private companyService: CompanyService,
  ) {}

  init() {
    console.log('init called');
    this._loading = true;
    this.keycloakService.loadUserProfile().then((profile) => {
      this._profile = profile;
      this.sync();
    });
  }

  private sync() {
    const userSync$ = this.http.post<UserRequiredActionsType>(
      `${environment.MASTERDATA}/user/sync`,
      {},
    );
    const companies$ = this.companyService.getCompaniesByUserId().pipe(
      catchError((error) => {
        // Handle or log error
        console.error('Error fetching companies', error);
        return of([]);
      }),
    );

    forkJoin([userSync$, companies$]).subscribe({
      next: ([userRequiredActions, companies]) => {
        this._userProfileWithActions = userRequiredActions;
        this._$userProfileWithActions = of(userRequiredActions);

        if (userRequiredActions.requiredActions.length > 0) {
          console.log('nav to complete profile');
          this.router.navigate(['/complete-profile']);
          return;
        }

        const selectedCompany = sessionStorage.getItem('company');
        console.log(selectedCompany);
        if (companies.length === 0 || !selectedCompany) {
          console.log('hier');
          this._isLockDashboard = true;
          this.router.navigate(['/lock-dashboard']);
        } else {
          this._isLockDashboard = false;
        }
      },
      complete: () => {
        this._loading = false;
      },
      error: (error) => {
        console.error('An error occurred', error);
        this._loading = false;
        // TODO Add proper error handling such as toast notification
      },
    });
  }

  logout() {
    this.keycloakService.logout('/');
  }

  completeUserProfile(completeUserProfileType: CompleteUserProfileType) {
    return this.http.post(
      `${environment.MASTERDATA}/user/complete-profile`,
      completeUserProfileType,
    );
  }

  login() {
    const header = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    let body = new HttpParams()
      .set('client_id', 'regiobiomatch-client')
      .set('username', 'mk')
      .set('password', 'mk')
      .set('grant_type', 'password')
      .set('scope', 'openid');

    return this.http.post(
      'https://auth.regiobiomatch.de/realms/regiobiomatch/protocol/openid-connect/token',
      body.toString(),
      { headers: header },
    );
  }
}
