import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, timer } from 'rxjs';
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
    return this.http.post(`${this.apiUrl}/purchase_intents`, purchaseIntentData);
  }

  // Fetch all Purchase Intents
  getPurchaseIntents(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/purchase_intents`);
  }

  // Fetch a single Purchase Intent by ID
  getPurchaseIntentById(purchaseIntentId: string): Observable<PurchaseIntentDetail> {
    return this.http.get<PurchaseIntentDetail>(`${this.apiUrl}/purchase_intents/${purchaseIntentId}`);
  }

  // Update a Purchase Intent's status
  updatePurchaseIntentStatus(purchaseIntentId: string, status: PurchaseIntentStatus): Observable<any> {
    return this.http.put(`${this.apiUrl}/purchase_intents/${purchaseIntentId}`, { status });
  }

  // Turn a Purchase Intent into an Order
  turnPurchaseIntentIntoOrder(purchaseIntentId: string, orderData: OrderWriteView): Observable<any> {
    return timer(1000).pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/purchase_intents/${purchaseIntentId}/orders`, orderData))
    );
  }

  // PRICE REQUEST SECTION

  // Create a Price Request
  createPriceRequest(priceRequestData: PriceRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/price_requests`, priceRequestData);
  }

  // Fetch all Price Requests
  getPriceRequests(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/price_requests`);
  }

  // Fetch a single Price Request by ID
  getPriceRequestById(priceRequestId: string): Observable<PriceRequestDetail> {
    return this.http.get<PriceRequestDetail>(`${this.apiUrl}/price_requests/${priceRequestId}`);
  }

  // Set price for a Price Request
  setPriceForPriceRequest(priceRequestId: string, pricePerUnit: number, status: PriceRequestStatus): Observable<any> {
    const payload = { status, pricePerUnit };
    return this.http.put(`${this.apiUrl}/price_requests/${priceRequestId}/price`, payload);
  }

  // Update the Price Request's status
  updatePriceRequestStatus(priceRequestId: string, status: PriceRequestStatus): Observable<any> {
    return this.http.put(`${this.apiUrl}/price_requests/${priceRequestId}/status`, { status });
  }

  // Add an Order to a Price Request
  addOrderToPriceRequest(priceRequestId: string, orderData: OrderWriteView): Observable<any> {
    return timer(1000).pipe(
      switchMap(() => this.http.post(`${this.apiUrl}/price_requests/${priceRequestId}/orders`, orderData))
    );
  }

  // ORDER SECTION

  // Fetch the current company's orders with date filter
  getCompanyOrders(dateFrom?: string, dateUntil?: string): Observable<string[]> {
    let params = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateUntil) {
      params = params.set('dateUntil', dateUntil);
    }

    return this.http.get<string[]>(`${this.apiUrl}/orders`, { params });
  }

  // Fetch a specific order by ID
  getOrderById(orderId: string): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/orders/${orderId}`);
  }

  // Update order status (e.g., mark it as completed)
  updateOrderStatus(orderId: string, isCompleted: boolean, completed: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/orders/${orderId}`, { isCompleted, completed });
  }
}

// MODELS

// PURCHASE INTENT MODELS

export interface PurchaseIntent {
  offerRef: string;
  deliveryDate: string; // Format should be 'YYYY-MM-DD'
  message: string;
  containers: any[];
  totalAmount: {
    amount: number;
    unit: string;
  };
}

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

export type PurchaseIntentStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELED_BY_BUYER" | "CANCELED_BY_SELLER" | "REJECTED";

// PRICE REQUEST MODELS

export interface PriceRequest {
  offerRef: string;
  message: string;
  deliveryDate: string;
  containers: any[];
  totalAmount: {
    amount: number;
    unit: string;
  };
}

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

export type PriceRequestStatus = "PENDING" | "PRICE_ADDED" | "COMPLETED" | "CANCELED_BY_BUYER" | "CANCELED_BY_SELLER" | "REJECTED";

// ORDER MODELS

export interface OrderWriteView {
  invoiceAddress: OrderAddressWriteView;
  deliveryAddress: OrderAddressWriteView;
  paymentType: string; // Example: "ON_ACCOUNT"
}

export interface OrderAddressWriteView {
  type: string;
  name: string;
  suffix?: string;
  street: string;
  zipcode: string;
  city: string;
}

export interface OrderDetail {
  amount: {
    amount: number;
    unit: string;
  };
  dateCreated: string;
  totalPrice: number;
  pricePerUnit: number;
  productLabel: string;
  payment: string; // Example: "ON_ACCOUNT"
  containers: any[];
  addresses: any[];
  levelsOfProcessing: any[];
  status: string;
  isCompleted: boolean;
  links: {
    self: string;
    offer: string;
    category: string;
    buyingPerson: string;
    buyingCompany: string;
    sellingPerson: string;
    sellingCompany: string;
    invoice: string;
  };
  completed: boolean;
}
