import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf, NgFor, CommonModule } from '@angular/common';
// import { MapComponent } from './components/map/map.component';
import { NearOffersCardComponent } from './components/near-offers-card/near-offers-card.component';
import { OfferService } from '../shared/services/offer.service';
import { SupabaseService } from '../shared/services/supabase.service';
import { PublicRecipeType } from '../shared/types/public-recipe.type';
import { PublicRecipeService } from '../shared/services/public-recipe.service';
import { NgOptimizedImage } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AddressType } from '../shared/types/address.type';
import { OfferType } from '../shared/types/offer.type';
import { MenuplanType } from '../shared/types/menuplan.type';
import { SearchComponent } from './components/search/search.component';
import { DialogModule } from 'primeng/dialog';
import { SeasonCalendarComponent } from './components/season-calendar/season-calendar/season-calendar.component';
import {
  StoreService,
  rbmRole,
  NearbuyRole,
} from '../shared/store/store.service';
import { Subscription } from 'rxjs';
import { RecipeService } from '../shared/services/recipe.service';
import { NewMenuplanService } from '../shared/services/new-menuplan.service';
import { RecipeType } from '../shared/types/recipe.type';
import { filter, switchMap } from 'rxjs/operators';
import { CompanyType } from '../shared/types/company.type';
import Sortable from 'sortablejs';
import { CompanyService } from '../shared/services/company.service';
import { MapComponent } from '../dashboard2/components/map/map.component';

interface DashboardItem {
  type: string;
  title: string;
  component?: any;
  method?: () => void;
}

@Component({
  selector: 'app-new-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    // MapComponent,
    NearOffersCardComponent,
    NgOptimizedImage,
    NgFor,
    NgIf,
    SearchComponent,
    CardModule,
    ButtonModule,
    DialogModule,
    SeasonCalendarComponent,
    CommonModule,
    MapComponent,
  ],
})
export class DashboardComponent {
  @ViewChild('dashboardGrid') dashboardGridElement!: ElementRef;
  randomRecipes: PublicRecipeType[] = [];
  companyRecipes: RecipeType[] = [];
  publicRecipes: PublicRecipeType[] = [];
  suggestedRecipes: PublicRecipeType[] = [];
  selectedRecipe: RecipeType | null = null;
  selectedMenu: MenuplanType | null = null;
  offers: OfferType[] = [];
  loaded = false;
  private subscription: Subscription = new Subscription();
  recentMenus: MenuplanType[] = [];
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  searchName: string = '';
  selectedSortOption: string = 'recipeName,asc';
  fromDate: Date | null = null;
  toDate: Date | null = null;
  displayRecipeDialog: boolean = false;
  displayMenuDialog: boolean = false;
  rbmRole: rbmRole = 'gastro';
  nearbuyRoles: NearbuyRole[] = [];
  selectedCompany: CompanyType | null = null;
  dashboardConfig: any;
  dashboardComponents: DashboardItem[] = [];
  private sortableInstance: Sortable | null = null;
  private sortableInitialized = false;
  private routerSubscription!: Subscription;
  private viewInitialized = false;
  companies: CompanyType[] = [];
  mapLat: number = 0;
  mapLng: number = 0;

  constructor(
    public offerService: OfferService,
    private publicRecipeService: PublicRecipeService,
    private store: StoreService,
    private recipeService: RecipeService,
    private menuplanService: NewMenuplanService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private companyService: CompanyService,
  ) {}

  ngOnInit() {
    this.loadCompanyAndRoles(); // This will call loadDashboardComponents
    this.loadCompanyRecipes();
    this.loadPublicRecipes();
    this.getOffers();
    this.getRecentMenus();
    this.getCompanies();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('Navigation ended, reinitializing Sortable');
        this.sortableInitialized = false;
        this.initSortableIfPossible();
      });
  }

  ngAfterViewInit() {
    console.log('View initialized');
    this.viewInitialized = true;
    this.initSortableIfPossible();
  }

  ngAfterViewChecked() {
    this.initSortableIfPossible();
  }

  getCompanies() {
    this.subscription.add(
      this.companyService.companies$.subscribe((companies) => {
        this.companies = companies;
        // Trigger change detection if needed
        this.cdr.detectChanges();
      }),
    );
  }

  private initSortableIfPossible() {
    if (
      this.viewInitialized &&
      !this.sortableInitialized &&
      this.dashboardGridElement
    ) {
      console.log('Initializing Sortable');
      this.initSortable();
      this.sortableInitialized = true;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    console.log('DashboardComponent being destroyed');
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private initSortable() {
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }

    const el = this.dashboardGridElement.nativeElement;
    if (el) {
      console.log('Dashboard grid element found:', el);
      this.sortableInstance = Sortable.create(el, {
        animation: 150,
        ghostClass: 'blue-background-class',
        handle: '.dashboard-item-handle',
        draggable: '.dashboard-item',
        onStart: (evt) => {
          console.log('Drag started', evt);
        },
        onEnd: (evt: any) => {
          console.log('Drag ended', evt);
          const newIndex = evt.newIndex;
          const oldIndex = evt.oldIndex;

          // Update the order in your array
          const item = this.dashboardComponents.splice(oldIndex, 1)[0];
          this.dashboardComponents.splice(newIndex, 0, item);

          // Save the new configuration
          this.saveDashboardConfiguration();

          // Trigger change detection
          this.cdr.detectChanges();
        },
      });
      console.log('Sortable instance created:', this.sortableInstance);
    } else {
      console.error('Dashboard grid element not found');
    }
  }

  private destroySortable() {
    if (this.sortableInstance) {
      console.log('Destroying existing Sortable instance');
      this.sortableInstance.destroy();
      this.sortableInstance = null;
    }
  }

  openRecipeDetails(recipe: RecipeType) {
    this.selectedRecipe = recipe;
    this.displayRecipeDialog = true;
    this.displayMenuDialog = false;
    this.cdr.detectChanges();
  }

  openMenuDetails(menu: MenuplanType) {
    this.selectedMenu = menu;
    this.displayMenuDialog = true;
    this.displayRecipeDialog = false;
    this.cdr.detectChanges();
  }

  loadCompanyRecipes(): void {
    const seasons = this.getSeasonsFromDateRange(this.fromDate, this.toDate);
    this.store.selectedCompanyContext$
      .pipe(
        filter((company) => company !== null && company.id !== undefined),
        switchMap((company) =>
          this.recipeService.getRecipesByCompanyId(
            this.currentPage,
            this.pageSize,
            this.selectedSortOption,
            this.searchName,
            seasons,
          ),
        ),
      )
      .subscribe(
        (page) => {
          this.companyRecipes = page.content;
          this.totalElements = page.totalElements;
        },
        (error) => {
          console.error('Error loading company recipes:', error);
        },
      );
  }

  loadPublicRecipes(): void {
    this.publicRecipeService.getRecipes().subscribe(
      (recipes: PublicRecipeType[]) => {
        this.publicRecipes = recipes;
        this.suggestedRecipes = this.getRandom(recipes, 20);
        this.randomRecipes = this.getRandom(recipes, 3);
      },
      (error) => {
        console.error('Error loading public recipes:', error);
      },
    );
  }

  getSeasonsFromDateRange(
    fromDate: Date | null,
    toDate: Date | null,
  ): string[] {
    if (!fromDate || !toDate) {
      return [];
    }

    const seasons = [];
    const startMonth = fromDate.getMonth() + 1;
    const endMonth = toDate.getMonth() + 1;

    if (
      startMonth <= 2 ||
      startMonth === 12 ||
      endMonth <= 2 ||
      endMonth === 12
    ) {
      seasons.push('Winter');
    }
    if (
      (startMonth <= 5 && startMonth >= 3) ||
      (endMonth <= 5 && endMonth >= 3)
    ) {
      seasons.push('Spring');
    }
    if (
      (startMonth <= 8 && startMonth >= 6) ||
      (endMonth <= 8 && endMonth >= 6)
    ) {
      seasons.push('Summer');
    }
    if (
      (startMonth <= 11 && startMonth >= 9) ||
      (endMonth <= 11 && endMonth >= 9)
    ) {
      seasons.push('Autumn');
    }

    return seasons;
  }

  getOffers() {
    this.subscription.add(
      this.offerService.offers$.subscribe((offers) => {
        console.log('Offers updated', offers);
        this.offers = offers;
        this.cdr.detectChanges();
      }),
    );

    this.subscription.add(
      this.store.selectedCompanyContext$.subscribe((company) => {
        if (company && company.addresses && company.addresses.length > 0) {
          const addressUrl = company.addresses[0].self;
          this.offerService
            .getAddress(addressUrl)
            .subscribe((address: AddressType) => {
              console.log('Address updated', address);
              this.mapLat = address.lat;
              this.mapLng = address.lon;

              const searchRadiusInKM = 50;
              this.offerService.setOffersBySearchRadius(
                searchRadiusInKM,
                address,
              );

              this.cdr.detectChanges();
            });
        }
      }),
    );

    this.subscription.add(
      this.offerService.loaded$.subscribe((loaded) => {
        console.log('Offers loaded:', loaded);
        this.loaded = loaded;
        this.cdr.detectChanges();
      }),
    );
  }

  getRecentMenus() {
    this.store.selectedCompanyContext$
      .pipe(
        filter((company) => company !== null),
        switchMap((company) => this.menuplanService.getAllMenuPlans()),
      )
      .subscribe(
        (menus) => {
          this.recentMenus = menus.slice(0, 3); // Get the first 3 menus
        },
        (error) => {
          console.error('Error loading menus:', error);
        },
      );
  }

  loadCompanyAndRoles(): void {
    this.store.selectedCompanyContext$.subscribe(
      (company) => {
        if (company) {
          this.selectedCompany = company;
          console.log('Selected company:', company);
          this.loadDashboardComponents();
        }
      },
      (error) => {
        console.error('Error loading selected company:', error);
      },
    );

    this.store.rbmRole$.subscribe(
      (rbmRole) => {
        this.rbmRole = 'gastro'; //unbedingt wieder auf rbmRole setzen!!!
        console.log('Current RBM Role:', this.rbmRole);
        this.loadDashboardComponents();
      },
      (error) => {
        console.error('Error loading RBM role:', error);
      },
    );
  }

  loadDashboardComponents(): void {
    console.log('Loading dashboard components for role:', this.rbmRole);
    switch (this.rbmRole) {
      case 'gastro':
        this.dashboardComponents = [
          { type: 'map', title: 'Karte', component: MapComponent },
          {
            type: 'near-offers',
            title: 'Angebote in der Nähe',
            component: NearOffersCardComponent,
          },
          { type: 'search', title: 'Suche', component: SearchComponent },
          {
            type: 'season-calendar',
            title: 'Saisonkalender',
            component: SeasonCalendarComponent,
          },
          {
            type: 'recent-menus',
            title: 'Aktuelle Menüs',
            method: this.getRecentMenus.bind(this),
          },
          {
            type: 'company-recipes',
            title: 'Firmenrezepte',
            method: this.loadCompanyRecipes.bind(this),
          },
          {
            type: 'public-recipes',
            title: 'Öffentliche Rezepte',
            method: this.loadPublicRecipes.bind(this),
          },
        ];
        break;
      case 'producer':
        this.dashboardComponents = [
          //{ type: 'my-products', title: 'Meine Produkte', component: MyProductsComponent },
          //{ type: 'my-orders', title: 'Meine Aufträge', component: MyOrdersComponent },
          { type: 'map', title: 'Meine Region', component: MapComponent },
          {
            type: 'season-calendar',
            title: 'Mein Saisonkalender',
            component: SeasonCalendarComponent,
          },
          //{ type: 'top-products', title: 'Top Erzeugnisse meiner Region', component: TopProductsComponent },
          {
            type: 'search',
            title: 'Suche in meiner Region',
            component: SearchComponent,
          },
          //{ type: 'top-recipes', title: 'Top Rezepte meiner Region', component: TopRecipesComponent }
        ];
        break;
      case 'refiner':
        this.dashboardComponents = [
          //{ type: 'my-products', title: 'Meine Produkte', component: MyProductsComponent },
          //{ type: 'my-suppliers', title: 'Meine Lieferanten', component: MySuppliersComponent },
          //{ type: 'my-orders', title: 'Meine Aufträge', component: MyOrdersComponent },
          { type: 'map', title: 'Meine Region', component: MapComponent },
          {
            type: 'season-calendar',
            title: 'Mein Saisonkalender',
            component: SeasonCalendarComponent,
          },
          //{ type: 'top-products', title: 'Top Erzeugnisse meiner Region', component: TopProductsComponent },
          {
            type: 'search',
            title: 'Suche in meiner Region',
            component: SearchComponent,
          },
          //{ type: 'top-recipes', title: 'Top Rezepte meiner Region', component: TopRecipesComponent }
        ];
        break;
    }
    this.loadDashboardConfiguration();
  }

  getRandom(arr: PublicRecipeType[], n: number): PublicRecipeType[] {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);
    if (n > len)
      throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
      const x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result as PublicRecipeType[];
  }

  loadDashboardConfiguration(): void {
    const savedConfig = localStorage.getItem(
      `dashboard-config-${this.rbmRole}`,
    );
    if (savedConfig) {
      const savedComponentTypes = JSON.parse(savedConfig);
      this.dashboardComponents = savedComponentTypes
        .map((type: string) =>
          this.dashboardComponents.find((comp) => comp.type === type),
        )
        .filter(
          (comp: DashboardItem | undefined): comp is DashboardItem =>
            comp !== undefined,
        );

      console.log('Loaded dashboard configuration:', this.dashboardComponents);
    }
  }

  saveDashboardConfiguration(): void {
    const componentTypes = this.dashboardComponents.map((comp) => comp.type);
    localStorage.setItem(
      `dashboard-config-${this.rbmRole}`,
      JSON.stringify(componentTypes),
    );
    console.log('Saved dashboard configuration:', componentTypes);
  }

  navigateToRecipes() {
    this.router.navigate(['/my-recipes']);
  }

  navigateToMenuPlanning() {
    this.router.navigate(['/menu-planning']);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index; // Use item.id if available, otherwise use the index
  }
}
