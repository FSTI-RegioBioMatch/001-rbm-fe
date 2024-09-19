import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Mapped Offers Ingredients Models
export interface MappedOffersIngredient {
  ingredient: Ingredient[];
  offers: OfferWrapper[];
  status: string;
  selected: boolean;
}

export interface Ingredient {
  name: string;
  unit: string;
  totalAmount: number;
  sourceRecipes: string[];
  category: string;
  convertible: boolean;
  processingBreakdown: { [key: string]: number };
  totalInLargestUnit: string;
}

export interface OfferWrapper {
  offer: Offer;
  selected: boolean;
}

export interface Offer {
  resultType: string;
  company: Company;
  address: Address;
  roles: string[];
  product: Product;
  links: Links;
  ontoFoodType: OntoFoodType;
  offerDetails: OfferDetails;
}

export interface Company {
  id: string;
  name: string;
  label: string;
  verified: boolean;
}

export interface Address {
  lat: number;
  lon: number;
  city: string;
}

export interface Product {
  dateStart: string;
  dateEnd: string;
  unit: string;
  totalAmount: number;
  isPermanent: boolean;
}

export interface Links {
  company: string;
  offer: string;
  request?: string;
  address: string;
  category: string;
}

export interface OntoFoodType {
  label: string;
  company: boolean;
  market: boolean;
  links: SubcategoryLinks;
}

export interface SubcategoryLinks {
  self: string;
  supercategories: string[];
  subcategories: string[];
}

export interface OfferDetails {
  id: string;
  dateCreated: string;
  dateModified: string;
  dateFrom: string;
  dateEnd: string;
  description: string;
  brandName?: string;
  productTitle?: string;
  productType: string;
  totalAmount: Amount;
  minAmount: Amount;
  pricePerUnit: number;
  graduatedPrices: GraduatedPrice[];
  levelsOfProcessing: LevelOfProcessing[];
  containers: Container[];
  productTraits?: any;
  caliber?: any;
  weight?: any;
  active: boolean;
  isDeleted: boolean;
  isPermanent: boolean;
  links: OfferLinks;
}

export interface Amount {
  amount: number;
  unit: string;
}

export interface GraduatedPrice {
  price: number;
  amount: number;
}

export interface LevelOfProcessing {
  label: string;
  self: Link;
}

export interface Container {
  id: string;
  containerType: string;
  amount: number;
  unit: string;
  innerContainer?: any;
  width?: any;
  length?: any;
  height?: any;
  dimensionUnit?: any;
  material?: any;
  returnable: boolean;
  returnableNotice?: any;
  traits: any[];
  links: Link;
}

export interface Link {
  self: string;
}

export interface OfferLinks {
  self: string;
  update: string;
  remove: string;
  company: string;
  category: string;
  contact: string;
  latestTradeItem?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MappedOffersIngredientsService {

  private apiUrl = environment.API_CORE;

  constructor(private http: HttpClient) { }

  // Create Mapped Offers Ingredients
  createMappedOffersIngredients(mappedOffersIngredientsData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/mapped-offers-ingredients`, mappedOffersIngredientsData);
  }

  // Fetch Mapped Offers Ingredients by Company ID with pagination
  getMappedOffersIngredientsByCompanyId(companyId: string, page: number = 0, size: number = 10, sort: string = 'shoppingListId,asc'): Observable<MappedOffersIngredient[]> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<MappedOffersIngredient[]>(`${this.apiUrl}/mapped-offers-ingredients`, { params });
  }

  // Fetch Mapped Offers Ingredients by ID
  getMappedOffersIngredientsById(id: string): Observable<MappedOffersIngredient> {
    return this.http.get<MappedOffersIngredient>(`${this.apiUrl}/mapped-offers-ingredients/${id}`);
  }

  // Update Mapped Offers Ingredients by ID
  updateMappedOffersIngredients(id: string, mappedOffersIngredientsData: MappedOffersIngredient): Observable<any> {
    return this.http.put(`${this.apiUrl}/mapped-offers-ingredients/${id}`, mappedOffersIngredientsData);
  }

  // Delete Mapped Offers Ingredients by ID
  deleteMappedOffersIngredientsById(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mapped-offers-ingredients/${id}`);
  }
}
