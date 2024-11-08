import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PixabayService {

  private apiUrl: string = 'https://pixabay.com/api/';  // Use the proxy path

  constructor(private http: HttpClient) {}

  searchImage(query: string, lang: string = 'de'): Observable<any> {
    const url = `${this.apiUrl}?key=46704953-fc7d6aee67f9a46e40959cf27&q=${encodeURIComponent(query)}&lang=${lang}&image_type=photo&order=popular&editors_choice=true&category=food`;
    return this.http.get(url);
  }
}
