import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { PublicRecipeType } from '../shared/types/public-recipe.type';
import { PublicRecipeService } from '../shared/services/public-recipe.service';
import { map, switchMap } from 'rxjs';
import { ImageType } from '../shared/types/image.type';
import {
  ColumnMode,
  DatatableComponent,
  NgxDatatableModule,
  SelectionType,
} from '@swimlane/ngx-datatable';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { StoreService } from '../shared/store/store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [
    NgxDatatableModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatPaginator,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
  ],
  templateUrl: './my-recipes.component.html',
  styleUrl: './my-recipes.component.scss',
})
export class MyRecipesComponent implements OnInit, AfterViewInit {
  rows: PublicRecipeType[] = [];
  temp: PublicRecipeType[] = [];
  selected: PublicRecipeType[] = [];

  ColumnMode = ColumnMode;
  recipes: PublicRecipeType[] = [];

  @ViewChild(DatatableComponent) table!: DatatableComponent;

  constructor(
    private publicRecipeService: PublicRecipeService,
    private store: StoreService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.getRecipes();
    // this.getRecipesPagination(50);
  }

  getRecipes() {
    this.publicRecipeService.getRecipes().subscribe((recipes) => {
      this.recipes = recipes;
      this.rows = recipes;
      this.temp = [...recipes];
    });
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.title.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  onRowSelected({ selected }: any) {
    console.log(selected);
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  onActivate(event: any) {
    console.log('Activate Event', event);
  }

  onClickCreateMenuPlan() {
    console.log('Create Menu Plan');
    this.store.selectedPublicRecipeSubject.next(this.selected);
    this.router.navigate(['/menu-planning']);
  }

  protected readonly SelectionType = SelectionType;
}
