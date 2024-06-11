import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CompanyService } from './company.service';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';
import { PersonType } from '../types/person.type';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private personSubject: BehaviorSubject<PersonType | null> =
    new BehaviorSubject<PersonType | null>(null);

  public person$: Observable<PersonType | null>;

  constructor(
    private http: HttpClient,
    private companyService: CompanyService,
  ) {
    this.person$ = this.personSubject.asObservable();
  }

  getPerson(): Observable<PersonType | null> {
    return this.person$;
  }

  initPersonMeInformation() {
    this.http
      .get<PersonType>(`${environment.NEARBUY_API}/persons/me`)
      .subscribe((person: PersonType) => {
        this.personSubject.next(person);
      });
  }
}
