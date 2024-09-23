import { Component, OnInit } from '@angular/core';
import { NewUserService } from '../shared/services/new-user.service';
import { forkJoin, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
  providers: [MessageService]
})
export class MyProfileComponent implements OnInit{

  user_profile: any;
  loading = false;
  employments: any[] = [];
  companies: any[] = [];
  companyAddresses: { [key: string]: any } = {}; // Object to store addresses by company ID

  constructor(
    private newUserService: NewUserService,
    private messageService: MessageService) {}

    ngOnInit(): void {
      this.loading = true;
  
      // Fetch user profile
      this.newUserService.getMe().subscribe({
        next: (profile) => {
          if (profile) {
            this.user_profile = profile;
  
            // Fetch employments using the user ID from profile
            const user_profile_id = this.user_profile.links.self.split('/').pop();
            this.fetchEmployments(user_profile_id);
            console.log(this.user_profile);
          } else {
            this.showMessage('warn', 'Benutzerprofil', 'Kein Benutzerprofil gefunden.');
            this.loading = false;
          }
        },
        error: () => {
          this.showMessage('error', 'Benutzerprofil', 'Fehler beim Abrufen des Benutzerprofils. Bitte versuchen Sie es später erneut.');
          this.loading = false;
        }
      });
    }
  
    // Method to fetch employments for the user
    fetchEmployments(userId: string): void {
      this.newUserService.getEmployments(userId).subscribe({
        next: (employments) => {
          this.employments = employments;
  
          // Check if employments have company data, and fetch company details
          if (employments.length > 0) {
            this.fetchAllCompanyDetails(employments);
          } else {
            this.showMessage('error', 'Anstellungen', 'Keine Anstellungen für diesen Benutzer verfügbar.');
            this.loading = false;
          }
        },
        error: () => {
          this.showMessage('error', 'Anstellungen', 'Fehler beim Abrufen der Anstellungen. Bitte versuchen Sie es später erneut.');
          this.loading = false; // Stop loading in case of error
        }
      });
    }
  
    // Method to fetch all company details for each employment
    fetchAllCompanyDetails(employments: any[]): void {
      const companyObservables = employments
        .map(employment => {
          const companyId = employment.links.company.split('/').pop();
          return this.newUserService.getCompany(companyId); // Create an observable for each company
        });
  
      // Use forkJoin to wait for all company details to be fetched
      forkJoin(companyObservables).subscribe({
        next: (companies) => {
          this.companies = companies; // Store all company details
          this.fetchAllCompanyAddresses(companies); // Fetch all addresses for the companies
        },
        error: () => {
          this.showMessage('error', 'Unternehmen', 'Fehler beim Abrufen der Unternehmensdaten. Bitte versuchen Sie es später erneut.');
          this.loading = false; // Stop loading in case of error
        }
      });
    }
  
    // Method to fetch all addresses for each company
    fetchAllCompanyAddresses(companies: any[]): void {
      const addressObservables = companies
        .map(company => {
          if (company.addresses && company.addresses.length > 0) {
            const addressId = company.addresses[0].self.split('/').pop(); // Get the first address ID
            return this.newUserService.getAddress(addressId).pipe(
              map(address => ({ companyId: company.id, address }))
            );
          }
          return of(null); // Return null if no address available
        })
        .filter(obs => obs !== null); // Filter out null observables
  
      if (addressObservables.length > 0) {
        forkJoin(addressObservables).subscribe({
          next: (addressData) => {
            addressData.forEach(data => {
              if (data) {
                this.companyAddresses[data.companyId] = data.address; // Store address by company ID
              }
            });
            console.log(this.companyAddresses);
            this.loading = false; // Stop loading after fetching all addresses
          },
          error: () => {
            this.showMessage('error', 'Adressen', 'Fehler beim Abrufen der Unternehmensadressen. Bitte versuchen Sie es später erneut.');
            this.loading = false; // Stop loading in case of error
          }
        });
      } else {
        this.loading = false; // Stop loading if no addresses to fetch
      }
    }
  
    // Helper method to display messages using MessageService
    showMessage(severity: string, summary: string, detail: string): void {
      this.messageService.add({ severity, summary, detail });
    }
  }