import { Component, OnInit } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { PrivateRecipeTableComponent } from '../../../my-recipes/components/private-recipe-table/private-recipe-table.component';

@Component({
  selector: 'app-add-additional-recipes-modal',
  standalone: true,
  imports: [
    NgxDatatableModule,
    MatDivider,
    MatButton,
    PrivateRecipeTableComponent,
  ],
  templateUrl: './add-additional-recipes-modal.component.html',
  styleUrl: './add-additional-recipes-modal.component.scss',
})
export class AddAdditionalRecipesModalComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
