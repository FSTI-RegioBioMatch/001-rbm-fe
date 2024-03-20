import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ProfileCompaniesComponent } from './components/profile-companies/profile-companies.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [MatTabGroup, MatTab, ProfileCompaniesComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent {}
