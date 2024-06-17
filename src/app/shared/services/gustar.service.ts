import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GustarService {


  private apiUrl = 'https://gustar-io-deutsche-rezepte.p.rapidapi.com';
  private headers = new HttpHeaders({
    'x-rapidapi-host': 'gustar-io-deutsche-rezepte.p.rapidapi.com',
    'x-rapidapi-key': '1070465204msh24854e6f469d340p154971jsn4cb21decaaf4',
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) { }

  // Crawl Recipe
  crawlRecipe(targetUrl: string): Observable<any> {
    const url = `${this.apiUrl}/crawl?target_url=${encodeURIComponent(targetUrl)}`;
    return this.http.get(url, { headers: this.headers });
  }

  // Diet Classifier
  dietClassifier(ingredients: { name: string, amount: number, unit: string }[]): Observable<any> {
    const url = `${this.apiUrl}/dietClassifier`;
    return this.http.post(url, { ingredients }, { headers: this.headers });
  }

  // Nutrition Estimator
  nutritionEstimator(ingredients: { name: string, amount: number, unit: string }[], portions: number): Observable<any> {
    const url = `${this.apiUrl}/nutrition`;
    return this.http.post(url, { ingredients, portions }, { headers: this.headers });
  }

  // Generate Recipe Image
  generateRecipeImage(title: string, ingredients: { name: string, amount: string }[], steps: string[], imageSize: string): Observable<any> {
    const url = `${this.apiUrl}/generateRecipeImage?image_size=${imageSize}`;
    const body = { title, ingredients, steps };
    return this.http.post(url, body, { headers: this.headers });
  }

  // Search Recipes
  searchRecipes(text: string, diet?: string, difficulty?: string, timeLimit?: number): Observable<any> {
    let url = `${this.apiUrl}/search_api?text=${encodeURIComponent(text)}`;
    if (diet) url += `&diet=${diet}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    if (timeLimit) url += `&timeLimit=${timeLimit}`;
    return this.http.get(url, { headers: this.headers });
  }

  // Generate Recipe in German
  generateRecipe(text: string): Observable<any> {
    const url = `${this.apiUrl}/generateRecipe`;
    const body = { text };
    return this.http.post(url, body, { headers: this.headers });
  }
}
