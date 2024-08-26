import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserType } from '../../shared/types/user.type';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersKey = 'users'; 

  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserType[]> {
    return of(this.getUsersFromStorage()).pipe(
      tap(users => console.log('Fetched users', users)),
      catchError(this.handleError<UserType[]>('getUsers', []))
    );
  }

  saveUser(user: UserType): Observable<UserType> {
    console.log('Saving user', user);
    return this.getUsers().pipe(
      map(users => [...users, user]),
      tap(users => this.saveUsersToStorage(users)),
      map(() => user),
      catchError(this.handleError<UserType>('saveUser'))
    );
  }

  private getUsersFromStorage(): UserType[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }

  private saveUsersToStorage(users: UserType[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    console.log('Saved users to storage', users);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}