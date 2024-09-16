import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UserType } from '../shared/types/user.type';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    CommonModule
  ],
  providers: [MessageService]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private userService: UserService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]],
      street: ['', Validators.required],
      houseNumber: ['', [Validators.required, Validators.pattern(/^[1-9]\d*(?:[-\s]?(?:[a-zA-Z]+|\d+))?$/)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)]],
      role: ['', [Validators.required]], 
      privacyPolicy: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.saveUser(this.registerForm.value as UserType);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Validierungsfehler', detail: 'Bitte korrigieren Sie die Fehler im Formular.' });
      this.markFormGroupTouched(this.registerForm);
    }
  }

  saveUser(userData: UserType): void {
    this.userService.saveUser(userData).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Benutzer erfolgreich registriert!' });
      },
      (error) => {
        console.error('Fehler beim Speichern der Benutzerdaten', error);
        this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Beim Registrieren des Benutzers ist ein Fehler aufgetreten.' });
      }
    );
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
}