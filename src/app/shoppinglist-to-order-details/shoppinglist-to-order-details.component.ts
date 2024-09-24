import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { OfferToOrderService, ShoppingListTrackModel } from '../shared/services/offer-to-order.service';
import { filter, switchMap, catchError, tap, map } from 'rxjs/operators';
import { StoreService } from '../shared/store/store.service';
import { ActivatedRoute } from '@angular/router';
import { of, forkJoin, Observable } from 'rxjs';
import { NearbuyTestService } from '../shared/services/nearbuy-test.service';
import { OrderService } from '../shared/services/order.service';
import { OfferService } from '../shared/services/offer.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { IngredientUnit } from '../shopping-list-details/shopping-list-details.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { StepperModule } from 'primeng/stepper';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

const ingredientUnits: IngredientUnit[] = [
  { label: 'Gramm', value: 'g' },
  { label: 'Kilogramm', value: 'kg' },
  { label: 'Liter', value: 'l' },
  { label: 'Milliliter', value: 'ml' },
  { label: 'Stück', value: 'pcs' },
  { label: 'Teelöffel', value: 'tsp' },
  { label: 'Esslöffel', value: 'tbsp' },
  { label: 'Tassen', value: 'cup' },
  { label: 'Pfund', value: 'lb' },
  { label: 'Unzen', value: 'oz' },
  { label: 'Pakete', value: 'pkg' },
  { label: 'Scheiben', value: 'slices' },
  { label: 'Prisen', value: 'pinch' },
  { label: 'Dosen', value: 'cans' },
  { label: 'Flaschen', value: 'bottles' },
  { label: 'Gläser', value: 'jars' },
  { label: 'Zentiliter', value: 'cl' },
  { label: 'Milligramm', value: 'mg' },
  { label: 'Dekagramm', value: 'dag' },
  { label: 'Gallonen', value: 'gallon' },
  { label: 'Pints', value: 'pint' },
  { label: 'Quarts', value: 'quart' },
  { label: 'Stangen', value: 'sticks' },
  { label: 'Blätter', value: 'leaves' },
  { label: 'Becher', value: 'beaker' },
  { label: 'Kellen', value: 'ladle' },
  { label: 'Zweige', value: 'sprigs' },
  { label: 'Köpfe', value: 'heads' },
  { label: 'Zehen', value: 'cloves' },
  { label: 'Schalen', value: 'peels' },
  { label: 'Hände', value: 'hands' },
  { label: 'Bündel', value: 'bunches' },
  { label: 'Blöcke', value: 'blocks' },
  { label: 'Körner', value: 'grains' },
];

@Component({
  selector: 'app-shoppinglist-to-order-details',
  templateUrl: './shoppinglist-to-order-details.component.html',
  styleUrls: ['./shoppinglist-to-order-details.component.scss'],
  providers: [MessageService],
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    DialogModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    StepperModule,
    TabViewModule,
    TooltipModule
    
  ],
  standalone: true
})


export class ShoppinglistToOrderDetailsComponent implements OnInit {

  loading = false;
  shoppingListToOrderObject: any;
  localizationData: { displayLabel: string; value: string }[] = [];
  shoppingListTrack: ShoppingListTrackModel | null = null; // Track model
  loadingOrders = false;
  ingredientStatusMap: { [ingredientId: string]: { mainStatus: string, subStatus: string } } = {};
  showRequestDialog: boolean = false;
  requestType: 'priceRequest' | 'purchaseIntent' | undefined;
  selectedOffer: any = null;
  requestData: any = {
    deliveryDate: '',
    message: '',
    totalAmount: '',
    pricePerUnit: '',
    unit: '',
  };


  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private offerToOrderService: OfferToOrderService,
    private store: StoreService,
    private nearbuyTestService: NearbuyTestService,
    private orderService: OrderService,
    private offerService: OfferService
  ) { }

  ngOnInit(): void {
    this.loading = true;
  
    this.store.selectedCompanyContext$
      .pipe(
        filter(company => company !== null),
        switchMap(() => this.route.paramMap),
        switchMap(params => {
          const id = params.get('id');
          if (id) {
            // Fetch shopping list details and localization data simultaneously
            return forkJoin({
              shoppingListToOrderObject: this.offerToOrderService.getMappedOffersIngredientsById(id).pipe(
                catchError(error => {
                  console.error('Error fetching shopping list to order object:', error);
                  this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Einkaufsliste' });
                  return of(null); // Return null on error
                })
              ),
              localizationData: this.nearbuyTestService.getData().pipe(
                catchError(error => {
                  console.error('Error fetching localization data:', error);
                  this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Lokalisierungsdaten' });
                  return of([]); // Return an empty array on error
                })
              )
            });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Es wurde keine ID angegeben' });
            this.loading = false;
            return of(null);
          }
        }),
        switchMap(result => {
          if (!result || !result.shoppingListToOrderObject) {
            return of(null);
          }
  
          this.shoppingListToOrderObject = result.shoppingListToOrderObject;
          this.localizationData = result.localizationData;
  
          // Now that we have the shoppingListToOrderObject, fetch the shopping list track
          return this.offerToOrderService.getOrCreateShoppingListTrack(this.shoppingListToOrderObject.shoppingListId).pipe(
            map(shoppingListTrack => ({
              ...result,
              shoppingListTrack // Add shoppingListTrack to the result
            })),
            catchError(error => {
              console.error('Error fetching or creating shopping list track:', error);
              this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden oder Erstellen des Einkaufstracks' });
              return of({
                ...result,
                shoppingListTrack: null // Return result with null shoppingListTrack on error
              });
            })
          );
        }),
        switchMap(result => {
          if (!result || !result.shoppingListToOrderObject) {
            return of(null);
          }
  
          this.shoppingListToOrderObject = result.shoppingListToOrderObject;
          this.localizationData = result.localizationData;

  
          // Fetch offer details with error handling
          const offerDetailObservables: Observable<any>[] = [];
          const mappedOffersIngredients: any[] = this.shoppingListToOrderObject.mappedOffersIngredients || [];
  
          mappedOffersIngredients.forEach((item: any) => {
            if (item.offers && item.offers.length > 0) {
              item.offers.forEach((offerItem: any) => {
                const offerId = offerItem.offer.offerDetails.id;
  
                const offerDetail$ = this.offerToOrderService.getOfferById(offerId).pipe(
                  tap(offerDetails => {
                    offerItem.offer.offerDetails.fullDetails = offerDetails;
                  }),
                  catchError(error => {
                    console.error('Error fetching offer details:', error);
                    this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden des Angebots für ID: ${offerId}` });
                    return of(null); // Continue on error
                  })
                );
                offerDetailObservables.push(offerDetail$);
              });
            }
          });
  
          if (offerDetailObservables.length > 0) {
            // Use `concat` to handle each observable separately
            return forkJoin(offerDetailObservables).pipe(
              map(() => result),
              catchError(error => {
                console.error('Error fetching one or more offer details:', error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Einige Angebotsdetails konnten nicht geladen werden' });
                return of(result); // Continue even if some offer details fail
              })
            );
          } else {
            return of(result);
          }
        })
      )
      .subscribe({
        next: result => {
          if (result) {
            this.shoppingListToOrderObject = result.shoppingListToOrderObject;
            this.localizationData = result.localizationData;
            this.shoppingListTrack = result.shoppingListTrack;
  
            this.fetchAllOrders();
          }
          this.loading = false;
        },
        error: error => {
          console.error('Error fetching shopping list or track:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Laden der Einkaufsliste oder des Trackings' });
          this.loading = false;
        }
      });
  }
  
  

  getLocalizedLabel(ingredientName: string): string {
    const localizedItem = this.localizationData.find(item => item.value === ingredientName);
    return localizedItem ? localizedItem.displayLabel : ingredientName;
  }

  openRequestDialog(offer: any, requestType: 'priceRequest' | 'purchaseIntent'): void {
    this.selectedOffer = offer;
    this.requestType = requestType;
    this.requestData.message = `Anfrage für ${this.getLocalizedLabel(offer.ontoFoodType.label)}`; // Default message in German
    this.requestData.totalAmount = offer.offerDetails.minAmount?.amount || offer.offerDetails.totalAmount; // Set default amount to minimum or total available
    this.requestData.pricePerUnit = offer.offerDetails.pricePerUnit || 'N/A';
    this.requestData.unit = offer.offerDetails.unit;
    this.showRequestDialog = true;
  }

  cancelRequest(): void {
    this.showRequestDialog = false;
  }

  submitRequest(): void {
    const enteredAmount = parseFloat(this.requestData.totalAmount);
    
    // Validate the entered amount
  
    // Check if delivery date is entered, add more validation
    if (!this.requestData.deliveryDate) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bitte ein Lieferdatum angeben.' });
      return;
    }
  
    // Submit the request based on the request type
    if (this.requestType === 'priceRequest') {
      this.makePriceRequest(this.selectedOffer, this.requestData.deliveryDate, this.requestData.message, enteredAmount);
    } else if (this.requestType === 'purchaseIntent') {
      this.makePurchaseIntent(this.selectedOffer, this.requestData.deliveryDate, this.requestData.message, enteredAmount);
    }
  
    // Close the dialog
    this.showRequestDialog = false;
  }

  makePriceRequest(offer: any, deliveryDate: string, message: string, totalAmount: number): void {
    const priceRequest = {
      offerRef: offer.links.offer,
      message: message,
      deliveryDate: deliveryDate,
      containers: [],
      totalAmount: {
        amount: totalAmount, // Use user-entered amount
        unit: offer.product.unit // Use the unit from offer details
      }
    };

    this.orderService.createPriceRequest(priceRequest).subscribe({
      next: response => {
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Preisanfrage erfolgreich gesendet' });
        const priceRequestId = response.links.self.split('/').pop();
        if (priceRequestId && this.shoppingListTrack) {
          if (!this.shoppingListTrack.priceRequestIds.includes(priceRequestId)) {
            this.shoppingListTrack.priceRequestIds.push(priceRequestId);
            this.updateShoppingListTrack(this.shoppingListTrack);
          }
        }
      },
      error: error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Preisanfrage konnte nicht gesendet werden' });
        console.error('Error creating Price Request:', error);
      }
    });
  }

  makePurchaseIntent(offer: any, deliveryDate: string, message: string, totalAmount: number): void {
    const purchaseIntent = {
      offerRef: offer.offerDetails.id,
      deliveryDate: deliveryDate,
      message: message,
      containers: [],
      totalAmount: {
        amount: totalAmount, // Use user-entered amount
        unit: offer.product.unit // Use the unit from offer details
      }
    };

    this.orderService.createPurchaseIntent(purchaseIntent).subscribe({
      next: response => {
        this.messageService.add({ severity: 'success', summary: 'Erfolg', detail: 'Kaufabsicht erfolgreich gesendet' });
        const purchaseIntentId = response.links.self.split('/').pop();
        if (purchaseIntentId && this.shoppingListTrack) {
          if (!this.shoppingListTrack.purchaseIntedIds.includes(purchaseIntentId)) {
            this.shoppingListTrack.purchaseIntedIds.push(purchaseIntentId);
            this.updateShoppingListTrack(this.shoppingListTrack);
          }
        }
      },
      error: error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht konnte nicht gesendet werden' });
        console.error('Error creating Purchase Intent:', error);
      }
    });
  }

  private updateShoppingListTrack(track: ShoppingListTrackModel): void {
    if (track && track.id) {
      this.offerToOrderService.updateShoppingListTrack(track.id, track).subscribe({
        next: () => {
          console.log('ShoppingListTrack successfully updated');
          this.ngOnInit()
        },
        error: error => {
          console.error('Error updating ShoppingListTrack:', error);
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Aktualisieren des Einkaufslistentracks' });
        }
      });
    }
  }

  private fetchAllOrders(): void {
    this.loadingOrders = true;
  
    this.getCombinedOrders()
      .pipe(
        catchError(error => {
          // Handle general errors for the combined orders
          this.loadingOrders = false;
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellungen konnten nicht geladen werden' });
          console.error('Error loading orders and recurring orders:', error);
          return of([[], []]); // Continue with empty arrays if an error occurs
        })
      )
      .subscribe({
        next: ([priceRequestsData, purchaseIntentsData, orderData]) => {
          console.log("orderdata", orderData)
          this.mapRequestsAndIntentsToIngredients(priceRequestsData, purchaseIntentsData, orderData);
          this.loadingOrders = false;
        },
        error: (error) => {
          this.loadingOrders = false;
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellungen konnten nicht geladen werden' });
          console.error('Error loading orders and recurring orders:', error);
        }
      });
  }

  private getCombinedOrders(): Observable<[any[], any[], any[]]> {
    if (!this.shoppingListTrack) {
      return of([[], [], []]);
    }
  
    const priceRequestDetails$ = this.shoppingListTrack.priceRequestIds.length > 0
      ? forkJoin(
          this.shoppingListTrack.priceRequestIds.map(id =>
            this.orderService.getPriceRequestById(id).pipe(
              catchError(error => {
                console.error(`Error fetching price request with ID: ${id}`, error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden der Preisanfrage mit ID: ${id}` });
                return of(null); // Continue with null if an error occurs
              })
            )
          )
        ).pipe(
          map(results => results.filter(item => item !== null)) // Filter out nulls to keep only successful results
        )
      : of([]);
  
    const purchaseIntentDetails$ = this.shoppingListTrack.purchaseIntedIds.length > 0
      ? forkJoin(
          this.shoppingListTrack.purchaseIntedIds.map(id =>
            this.orderService.getPurchaseIntentById(id).pipe(
              catchError(error => {
                console.error(`Error fetching purchase intent with ID: ${id}`, error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden der Kaufabsicht mit ID: ${id}` });
                return of(null); // Continue with null if an error occurs
              })
            )
          )
        ).pipe(
          map(results => results.filter(item => item !== null)) // Filter out nulls to keep only successful results
        )
      : of([]);
  
      const orderDetails$ = this.shoppingListTrack.orderIds.length > 0
      ? forkJoin(
          this.shoppingListTrack.orderIds.map(id =>
            this.orderService.getOrderById(id).pipe(
              catchError(error => {
                console.error(`Error fetching orders with ID: ${id}`, error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden der Bestellung mit ID: ${id}` });
                return of(null); // Continue with null if an error occurs
              })
            )
          )
        ).pipe(
          map(results => results.filter(item => item !== null)) // Filter out nulls to keep only successful results
        )
      : of([]);

    return forkJoin([priceRequestDetails$, purchaseIntentDetails$, orderDetails$]);
  }

  private mapRequestsAndIntentsToIngredients(priceRequests: any[], purchaseIntents: any[], orders: any[]): void {
    const mappedOffersIngredients: any[] = this.shoppingListToOrderObject.mappedOffersIngredients;
    const fetchObservables: Observable<any>[] = [];
  
    // Map price requests
    priceRequests.forEach((priceRequest) => {
      mappedOffersIngredients.forEach((ingredient) => {
        ingredient.offers.forEach((offer: any) => {
          if (priceRequest.links.offer === offer.offer.links.offer) {
            const fetchDetail$ = this.fetchPriceRequestDetails(priceRequest.links.self).pipe(
              tap((details: any) => {
                if (details) {
                  offer.priceRequests = offer.priceRequests || [];
                  offer.priceRequests.push(details);
                  ingredient.priceRequests = ingredient.priceRequests || [];
                  ingredient.priceRequests.push(details);
                }
              }),
              catchError(error => {
                console.error(`Error fetching details for price request: ${priceRequest.links.self}`, error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden der Preisanfrage-Details: ${priceRequest.links.self}` });
                return of(null); // Continue with null if an error occurs
              })
            );
            fetchObservables.push(fetchDetail$);
          }
        });
      });
    });
  
    // Map purchase intents
    purchaseIntents.forEach((purchaseIntent) => {
      mappedOffersIngredients.forEach((ingredient) => {
        ingredient.offers.forEach((offer: any) => {
          if (purchaseIntent.links.offer === offer.offer.links.offer) {
            const fetchDetail$ = this.fetchPurchaseIntentDetails(purchaseIntent.links.self).pipe(
              tap((details: any) => {
                if (details) {
                  offer.purchaseIntents = offer.purchaseIntents || [];
                  offer.purchaseIntents.push(details);
                  ingredient.purchaseIntents = ingredient.purchaseIntents || [];
                  ingredient.purchaseIntents.push(details);
                }
              }),
              catchError(error => {
                console.error(`Error fetching details for purchase intent: ${purchaseIntent.links.self}`, error);
                this.messageService.add({ severity: 'error', summary: 'Fehler', detail: `Fehler beim Laden der Kaufabsicht-Details: ${purchaseIntent.links.self}` });
                return of(null); // Continue with null if an error occurs
              })
            );
            fetchObservables.push(fetchDetail$);
          }
        });
      });
    });
  
    // Map orders
    orders.forEach((order) => {
      mappedOffersIngredients.forEach((ingredient) => {
        ingredient.offers.forEach((offer: any) => {
          if (order.links.offer === offer.offer.links.offer) {
            offer.orders = offer.orders || [];
            offer.orders.push(order);
            ingredient.orders = ingredient.orders || [];
            ingredient.orders.push(order);
          }
        });
      });
    });
  
    // Wait for all fetches to complete
    if (fetchObservables.length > 0) {
      forkJoin(fetchObservables)
        .pipe(
          catchError(error => {
            console.error('Error mapping requests, intents, and orders:', error);
            this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Fehler beim Zuordnen der Anfragen, Absichten und Bestellungen' });
            return of(null); // Continue with null if an error occurs
          })
        )
        .subscribe({
          next: () => {
            console.log('Mapped Offers Ingredients with Details:', mappedOffersIngredients);
          },
          error: error => {
            console.error('Error mapping requests, intents, and orders:', error);
          }
        });
    } else {
      console.log('No price requests, purchase intents, or orders to map.');
    }
    console.log(this.shoppingListToOrderObject)
    this.evaluateIngredientStatuses()
  }
  
  

  fetchPriceRequestDetails(url: string): Observable<any> {
    return this.offerService.getPriceRequestDetails(url).pipe(
      switchMap(details => {
        const { links } = details;

        const relatedRequests = {
          offer$: this.offerService.getRelatedDetail(links.offer),
          category$: this.offerService.getRelatedDetail(links.category),
          buyingCompany$: this.offerService.getRelatedDetail(links.buyingCompany),
          sellingCompany$: this.offerService.getRelatedDetail(links.sellingCompany)
        };

        return forkJoin(relatedRequests).pipe(
          map(relatedData => ({
            ...details,
            offer: relatedData.offer$,
            category: relatedData.category$,
            buyingCompany: relatedData.buyingCompany$,
            sellingCompany: relatedData.sellingCompany$
          }))
        );
      }),
      catchError(error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Verknüpfte Daten konnten nicht geladen werden' });
        console.error('Error fetching price request details:', error);
        return of(null);
      })
    );
  }

  fetchPurchaseIntentDetails(url: string): Observable<any> {
    return this.offerService.getPurchaseIntentDetails(url).pipe(
      switchMap(details => {
        const { links } = details;

        const relatedRequests = {
          offer$: this.offerService.getRelatedDetail(links.offer),
          category$: this.offerService.getRelatedDetail(links.category),
          buyingCompany$: this.offerService.getRelatedDetail(links.buyingCompany),
          sellingCompany$: this.offerService.getRelatedDetail(links.sellingCompany)
        };

        return forkJoin(relatedRequests).pipe(
          map(relatedData => ({
            ...details,
            offer: relatedData.offer$,
            category: relatedData.category$,
            buyingCompany: relatedData.buyingCompany$,
            sellingCompany: relatedData.sellingCompany$
          }))
        );
      }),
      catchError(error => {
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Verknüpfte Daten konnten nicht geladen werden' });
        console.error('Error fetching purchase intent details:', error);
        return of(null);
      })
    );
  }

  makePurchaseIntentOrder(purchaseIntent: any) {
    console.log("Will turn purchase intent into an order for ", purchaseIntent);
  
    if (!purchaseIntent || purchaseIntent.status !== 'ACCEPTED') {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kaufabsicht wurde nicht ausgewählt oder ist noch nicht im AKZEPTIERT Status' });
      return;
    }
  
    const { buyingCompany, sellingCompany } = purchaseIntent;
    const fetchMainAddress = (company: { addresses: any[] }) => {
      if (company && company.addresses && company.addresses.length > 0) {
        const mainAddressUrl = company.addresses.find((addr: { type: string }) => addr.type === 'MAIN')?.self;
        if (mainAddressUrl) {
          return this.offerService.getRelatedDetail(mainAddressUrl);
        }
      }
      return of(null);
    };
  
    forkJoin({
      buyingCompanyMainAddress: fetchMainAddress(buyingCompany),
      sellingCompanyMainAddress: fetchMainAddress(sellingCompany)
    }).pipe(
      switchMap(addresses => {
        const invoiceAddress = {
          type: 'INVOICE',
          name: addresses.buyingCompanyMainAddress?.name || 'fallback Name',
          street: addresses.buyingCompanyMainAddress?.street || 'fallback Street',
          zipcode: addresses.buyingCompanyMainAddress?.zipcode || '00000',
          city: addresses.buyingCompanyMainAddress?.city || 'fallback City'
        };
  
        const deliveryAddress = {
          type: 'DELIVERY',
          name: addresses.sellingCompanyMainAddress?.name || 'fallback Name',
          street: addresses.sellingCompanyMainAddress?.street || 'fallback Street',
          zipcode: addresses.sellingCompanyMainAddress?.zipcode || '00000',
          city: addresses.sellingCompanyMainAddress?.city || 'fallback City'
        };
  
        const orderPayload = {
          invoiceAddress: invoiceAddress,
          deliveryAddress: deliveryAddress,
          paymentType: 'ON_ACCOUNT'
        };
  
        const purchaseIntentId = purchaseIntent.links.self.split('/').pop();
        return this.orderService.turnPurchaseIntentIntoOrder(purchaseIntentId, orderPayload);
      }),
      catchError(error => {
        console.error('Error turning purchase intent into an order:', error);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellung konnte nicht erstellt werden.' });
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        const orderId = response.links.self.split('/').pop();
        if (orderId && this.shoppingListTrack) {
          if (!this.shoppingListTrack.orderIds.includes(orderId)) {
            this.shoppingListTrack.orderIds.push(orderId);
            this.removePurchaseIntent(purchaseIntent);
            this.updateShoppingListTrack(this.shoppingListTrack);
          }
        }
      }
    });
  }
  
  private removePurchaseIntent(purchaseIntent: any) {
    if (this.shoppingListTrack && this.shoppingListTrack.purchaseIntedIds) { // Check for null or undefined
      const purchaseIntentId = purchaseIntent.links.self.split('/').pop();
      this.shoppingListTrack.purchaseIntedIds = this.shoppingListTrack.purchaseIntedIds.filter(id => id !== purchaseIntentId);
    }
  }

  makePriceRequestOrder(priceRequest: any) {
    console.log("Will turn price request into an order for ", priceRequest);
  
    if (!priceRequest || priceRequest.status !== 'PRICE_ADDED') {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Kein gültiger Preis ausgewählt' });
      return;
    }
  
    const { buyingCompany, sellingCompany } = priceRequest;
    const fetchMainAddress = (company: { addresses: any[] }) => {
      if (company && company.addresses && company.addresses.length > 0) {
        const mainAddressUrl = company.addresses.find((addr: { type: string }) => addr.type === 'MAIN')?.self;
        if (mainAddressUrl) {
          return this.offerService.getRelatedDetail(mainAddressUrl);
        }
      }
      return of(null);
    };
  
    forkJoin({
      buyingCompanyMainAddress: fetchMainAddress(buyingCompany),
      sellingCompanyMainAddress: fetchMainAddress(sellingCompany)
    }).pipe(
      switchMap(addresses => {
        const invoiceAddress = {
          type: 'INVOICE',
          name: addresses.buyingCompanyMainAddress?.name || 'fallback Name',
          street: addresses.buyingCompanyMainAddress?.street || 'fallback Street',
          zipcode: addresses.buyingCompanyMainAddress?.zipcode || '00000',
          city: addresses.buyingCompanyMainAddress?.city || 'fallback City'
        };
  
        const deliveryAddress = {
          type: 'DELIVERY',
          name: addresses.sellingCompanyMainAddress?.name || 'fallback Name',
          street: addresses.sellingCompanyMainAddress?.street || 'fallback Street',
          zipcode: addresses.sellingCompanyMainAddress?.zipcode || '00000',
          city: addresses.sellingCompanyMainAddress?.city || 'fallback City'
        };
  
        const orderPayload = {
          invoiceAddress: invoiceAddress,
          deliveryAddress: deliveryAddress,
          paymentType: 'ON_ACCOUNT'
        };
  
        const priceRequestId = priceRequest.links.self.split('/').pop();
        return this.orderService.addOrderToPriceRequest(priceRequestId, orderPayload);
      }),
      catchError(error => {
        console.error('Error turning price request into an order:', error);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Bestellung konnte nicht erstellt werden.' });
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        const orderId = response.links.self.split('/').pop();
        if (orderId && this.shoppingListTrack) {
          if (!this.shoppingListTrack.orderIds.includes(orderId)) {
            this.shoppingListTrack.orderIds.push(orderId);
            this.removePriceRequest(priceRequest);
            this.updateShoppingListTrack(this.shoppingListTrack);
          }
        }
      }
    });
  }
  
  private removePriceRequest(priceRequest: any) {
    if (this.shoppingListTrack && this.shoppingListTrack.priceRequestIds) { // Check for null or undefined
      const priceRequestId = priceRequest.links.self.split('/').pop();
      this.shoppingListTrack.priceRequestIds = this.shoppingListTrack.priceRequestIds.filter(id => id !== priceRequestId);
    }
  }
  getIngredientName(item: any): string {
    return item?.ingredient[0]?.name || 'Unknown Ingredient';
  }

  getTotalAmountsPerUnitArrayFromItem(item: any): { unit: string; totalAmount: number }[] {
    const totalAmountsPerUnit: { [unit: string]: number } = {};
  
    item?.ingredient?.forEach((ingredient: any) => {
      const unit = ingredient.unit;
      if (!totalAmountsPerUnit[unit]) {
        totalAmountsPerUnit[unit] = 0;
      }
      totalAmountsPerUnit[unit] += ingredient.totalAmount;
    });
  
    return Object.keys(totalAmountsPerUnit).map(unit => ({
      unit,
      totalAmount: totalAmountsPerUnit[unit],
    }));
  }
  getProcessingBreakdownFromItem(item: any): { label: string; unit: string; amount: number }[] {
    const combinedProcessingBreakdown: { [label: string]: { [unit: string]: number } } = {};
  
    item?.ingredient?.forEach((ingredient: any) => {
      const processingBreakdown = ingredient.processingBreakdown || {};
      const unit = ingredient.unit;
  
      for (const [label, amount] of Object.entries(processingBreakdown)) {
        if (!combinedProcessingBreakdown[label]) {
          combinedProcessingBreakdown[label] = {};
        }
        if (!combinedProcessingBreakdown[label][unit]) {
          combinedProcessingBreakdown[label][unit] = 0;
        }
        combinedProcessingBreakdown[label][unit] += amount as number;
      }
    });
  
    // Convert combinedProcessingBreakdown to an array
    const breakdownArray: { label: string; unit: string; amount: number }[] = [];
    for (const [label, unitAmounts] of Object.entries(combinedProcessingBreakdown)) {
      for (const [unit, amount] of Object.entries(unitAmounts)) {
        breakdownArray.push({
          label,
          unit,
          amount,
        });
      }
    }
  
    return breakdownArray;
  }
  getUnitLabel(unitValue: string): string {
    const unit = ingredientUnits.find(u => u.value === unitValue);
    return unit ? unit.label : unitValue; // Return the label if found, else return the value itself
  }
  getAggregatedRequestsAndIntents(item: any): { amount: number; unit: string; status: string }[] {
    const aggregation: { [unit: string]: { [status: string]: number } } = {};
  
    // Aggregate price requests
    item?.priceRequests?.forEach((request: any) => {
      const unit = request.amount.unit;
      const status = request.status;
      const amount = request.amount.amount;
  
      if (!aggregation[unit]) {
        aggregation[unit] = {};
      }
      if (!aggregation[unit][status]) {
        aggregation[unit][status] = 0;
      }
      aggregation[unit][status] += amount;
    });
  
    // Aggregate purchase intents
    item?.purchaseIntents?.forEach((intent: any) => {
      const unit = intent.amount.unit;
      const status = intent.status;
      const amount = intent.amount.amount;
  
      if (!aggregation[unit]) {
        aggregation[unit] = {};
      }
      if (!aggregation[unit][status]) {
        aggregation[unit][status] = 0;
      }
      aggregation[unit][status] += amount;
    });
  
    // Convert the aggregated data to an array format
    const aggregatedArray: { amount: number; unit: string; status: string }[] = [];
    Object.entries(aggregation).forEach(([unit, statusMap]) => {
      Object.entries(statusMap).forEach(([status, amount]) => {
        aggregatedArray.push({ amount, unit, status });
      });
    });
  
    return aggregatedArray;
  }
  getAggregatedOrders(item: any): { amount: number; unit: string; status: string; totalPrice: number }[] {
    const aggregation: { [unit: string]: { [status: string]: { totalPrice: number, amount: number } } } = {};
  
    // Aggregate orders
    item?.orders?.forEach((order: any) => {
      const unit = order.amount.unit;
      const status = order.status;
      const amount = order.amount.amount;
      const totalPrice = order.totalPrice || 0;
  
      if (!aggregation[unit]) {
        aggregation[unit] = {};
      }
      if (!aggregation[unit][status]) {
        aggregation[unit][status] = { totalPrice: 0, amount: 0 };
      }
      aggregation[unit][status].totalPrice += totalPrice;
      aggregation[unit][status].amount += amount;
    });
  
    // Convert the aggregated data to an array format
    const aggregatedArray: { amount: number; unit: string; status: string; totalPrice: number }[] = [];
    Object.entries(aggregation).forEach(([unit, statusMap]) => {
      Object.entries(statusMap).forEach(([status, values]) => {
        aggregatedArray.push({ 
          amount: values.amount, 
          unit, 
          status, 
          totalPrice: values.totalPrice 
        });
      });
    });
  
    return aggregatedArray;
  }

  preventInvalidChars(event: KeyboardEvent): void {
    // Prevent entering non-digit characters, except for '.', ',' and control keys
    if (!/[0-9.,]/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }
  }
  private evaluateIngredientStatuses(): void {
    this.shoppingListToOrderObject.mappedOffersIngredients.forEach((ingredient: any, index: number) => {
      let ingredientId = ingredient.id || ingredient.ingredient?.[0]?.name || `generated-id-${index}`;
  
      if (!ingredient.id) {
        console.warn(`Ingredient missing ID. Generating unique ID for ingredient: ${ingredient.ingredient?.[0]?.name}`, ingredient);
        ingredient.id = ingredientId;
      }
  
      // Aggregate data from all offers
      let aggregatedOrders: any[] = [];
      let aggregatedIntents: any[] = [];
      let aggregatedRequests: any[] = [];
  
      if (ingredient.offers && ingredient.offers.length > 0) {
        ingredient.offers.forEach((offer: any) => {
          if (offer.orders) {
            aggregatedOrders = [...aggregatedOrders, ...offer.orders];
          }
          if (offer.purchaseIntents) {
            aggregatedIntents = [...aggregatedIntents, ...offer.purchaseIntents];
          }
          if (offer.priceRequests) {
            aggregatedRequests = [...aggregatedRequests, ...offer.priceRequests];
          }
        });
      }
  
      // Initialize with default main and sub-status
      let mainStatus = 'OFFERS_AVAILABLE';
      let subStatus = 'OFFERS_FOUND';
  
      // 1. Check aggregated orders first
      if (aggregatedOrders.length > 0) {
        const pendingOrders = aggregatedOrders.filter((order: any) => order.status === 'PENDING');
        const completedOrders = aggregatedOrders.filter((order: any) => order.status === 'INVOICE_ADDED' || order.status === 'COMPLETED');
  
        if (completedOrders.length > 0) {
          mainStatus = 'ORDER_PLACED';
          subStatus = completedOrders.length > 1 ? 'MULTIPLE_ORDERS_COMPLETED' : 'SINGLE_ORDER_COMPLETED';
        } else if (pendingOrders.length > 0) {
          mainStatus = 'ORDER_PLACED';
          subStatus = pendingOrders.length > 1 ? 'MULTIPLE_ORDERS_PENDING' : 'SINGLE_ORDER_PENDING';
        }
      }
      // 2. Check aggregated purchase intents and price requests
      else if (aggregatedIntents.length > 0 || aggregatedRequests.length > 0) {
        mainStatus = 'REQUESTS_OR_INTENTS';
  
        const pendingIntents = aggregatedIntents.filter((intent: any) => intent.status === 'PENDING');
        const pendingRequests = aggregatedRequests.filter((pr: any) => pr.status === 'PENDING');
  
        const totalPending = pendingIntents.length + pendingRequests.length;
  
        if (totalPending > 1) {
          subStatus = 'MULTIPLE_REQUESTS_OR_INTENTS_PENDING';
        } else if (totalPending === 1) {
          subStatus = 'SINGLE_REQUEST_OR_INTENT_PENDING';
        } else {
          subStatus = 'ALL_REQUESTS_OR_INTENTS_COMPLETED';
        }
      }
      // 3. Check if there are any offers available
      else if (ingredient.offers && ingredient.offers.length > 0) {
        mainStatus = 'OFFERS_AVAILABLE';
        subStatus = 'OFFERS_FOUND';
      }
      // 4. Default to no offers if no intents, requests, or orders are found
      else {
        mainStatus = 'NO_OFFERS';
        subStatus = 'NO_OFFERS_FOUND';
      }
  
      // Update the status map with main and sub-status
      this.ingredientStatusMap[ingredientId] = { mainStatus, subStatus };
    });
  
    console.log('Ingredient statuses:', this.ingredientStatusMap);
  }

  // You can use this method to get the main and sub-status of an ingredient wherever needed
  getIngredientMainStatus(ingredientId: string): string {
    return this.ingredientStatusMap[ingredientId]?.mainStatus || 'NO_OFFERS';
  }

  getIngredientSubStatus(ingredientId: string): string {
    return this.ingredientStatusMap[ingredientId]?.subStatus || 'NO_OFFERS';
  }
  
}
