import { Component, OnInit } from '@angular/core';
import { ToolbarComponent } from '../../../../shared/toolbar/toolbar.component';
import { RecipeSearchToolbarComponent } from '../../../../my-recipes/components/recipe-search-toolbar/recipe-search-toolbar.component';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateCompanyModalComponent } from './components/create-company-modal/create-company-modal.component';

@Component({
  selector: 'app-profile-companies',
  standalone: true,
  imports: [
    ToolbarComponent,
    RecipeSearchToolbarComponent,
    MatFabButton,
    MatIcon,
    RouterLink,
  ],
  templateUrl: './profile-companies.component.html',
  styleUrl: './profile-companies.component.scss',
})
export class ProfileCompaniesComponent implements OnInit {
  constructor(private matDialog: MatDialog) {}

  ngOnInit(): void {
    this.onClickModalCreateNewCompany();
  }

  public onClickModalCreateNewCompany() {
    console.log('onClickModalCreateNewCompany');
    this.matDialog.open(CreateCompanyModalComponent, {
      width: '1000px',
      data: { name: 'Company Name' },
    });
  }
}
