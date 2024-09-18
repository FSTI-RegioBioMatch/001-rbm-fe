import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = environment.NEARBUY_API;

  constructor(private http: HttpClient) { }

  // PURCHASE INTENT SECTION

  // Create a Purchase Intent
  createPurchaseIntent(purchaseIntentData: PurchaseIntent): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/purchase_intents`, purchaseIntentData);
  }

  // Fetch all Purchase Intents
  getPurchaseIntents(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/v1/purchase_intents`);
  }

  // Fetch a single Purchase Intent by ID
  getPurchaseIntentById(purchaseIntentId: string): Observable<PurchaseIntentDetail> {
    return this.http.get<PurchaseIntentDetail>(`${this.apiUrl}/v1/purchase_intents/${purchaseIntentId}`);
  }

  // Update a Purchase Intent's status
  updatePurchaseIntentStatus(purchaseIntentId: string, status: PurchaseIntentStatus): Observable<any> {
    return this.http.put(`${this.apiUrl}/v1/purchase_intents/${purchaseIntentId}`, { status });
  }

  // PRICE REQUEST SECTION

  // Create a Price Request
  createPriceRequest(priceRequestData: PriceRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/v1/price_requests`, priceRequestData);
  }

  // Fetch all Price Requests
  getPriceRequests(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/v1/price_requests`);
  }

  // Fetch a single Price Request by ID
  getPriceRequestById(priceRequestId: string): Observable<PriceRequestDetail> {
    return this.http.get<PriceRequestDetail>(`${this.apiUrl}/v1/price_requests/${priceRequestId}`);
  }

  // Set price for a Price Request
  setPriceForPriceRequest(priceRequestId: string, pricePerUnit: number, status: PriceRequestStatus): Observable<any> {
    return this.http.put(`${this.apiUrl}/v1/price_requests/${priceRequestId}/price`, { pricePerUnit, status });
  }

  // Update the Price Request's status
  updatePriceRequestStatus(priceRequestId: string, status: PriceRequestStatus): Observable<any> {
    return this.http.put(`${this.apiUrl}/v1/price_requests/${priceRequestId}/status`, { status });
  }
}

// PURCHASE INTENT MODELS

// Define the interface for PurchaseIntent
export interface PurchaseIntent {
  offerRef: string;
  deliveryDate: string; // Format should be 'YYYY-MM-DD'
  message: string;
  containers: any[]; // You can further define the structure if needed
  totalAmount: {
    amount: number;
    unit: string; // Example: 'Liter'
  };
}

// Define the interface for PurchaseIntentDetail
export interface PurchaseIntentDetail {
  dateCreated: string;
  deliveryDate: string;
  amount: {
    amount: number;
    unit: string;
  };
  containers: any[];
  levelsOfProcessing: any[];
  totalPrice: number;
  pricePerUnit: number;
  status: string;
  links: {
    self: string;
    update: string;
    offer: string;
    category: string;
    buyingCompany: string;
    buyingPerson: string;
    sellingCompany: string;
    sellingPerson: string;
  };
}

// Define the enum for PurchaseIntentStatus
export type PurchaseIntentStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED_BY_BUYER" | "CANCELED_BY_SELLER" | "REJECTED";

// PRICE REQUEST MODELS

// Define the interface for PriceRequest
export interface PriceRequest {
  offerRef: string;
  message: string;
  deliveryDate: string; // Format should be 'YYYY-MM-DD'
  containers: any[];
  totalAmount: {
    amount: number;
    unit: string;
  };
}

// Define the interface for PriceRequestDetail
export interface PriceRequestDetail {
  dateCreated: string;
  deliveryDate: string;
  amount: {
    amount: number;
    unit: string;
  };
  containers: any[];
  levelsOfProcessing: any[];
  totalPrice: number;
  pricePerUnit: number;
  status: string;
  links: {
    self: string;
    updateStatus: string;
    updatePrice: string;
    offer: string;
    category: string;
    buyingCompany: string;
    buyingPerson: string;
    sellingCompany: string;
    sellingPerson: string;
  };
}

// Define the enum for PriceRequestStatus
export type PriceRequestStatus = "PENDING" | "PRICE_ADDED" | "COMPLETED" | "CANCELED_BY_BUYER" | "CANCELED_BY_SELLER" | "REJECTED";
