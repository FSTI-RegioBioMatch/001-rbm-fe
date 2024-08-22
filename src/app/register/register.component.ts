import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

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

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.saveUser(this.registerForm.value);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please correct the errors in the form.' });
      this.markFormGroupTouched(this.registerForm);
    }
  }

  saveUser(userData: any): void {
    // Simulate saving the user data and handle the response
    try {
      // Replace with actual service call
      console.log('Saving user data', userData);
      
      // If successful:
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User registered successfully!' });
      
    } catch (error) {
      // If there's an error:
      console.error('Error saving user data', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while registering the user.' });
    }
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
