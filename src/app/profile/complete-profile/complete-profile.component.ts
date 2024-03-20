import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { CompleteUserProfileType } from './types/complete-user-profile.type';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { RequiredActionsEnum } from '../../shared/enums/required-actions.enum';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatButton,
    MatCheckbox,
    MatHint,
  ],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.scss',
})
export class CompleteProfileComponent implements OnInit {
  form: FormGroup;

  constructor(
    public userService: UserService,
    private router: Router,
  ) {
    this.form = new FormGroup({
      isPrivacyPolicyAccepted: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    if (this.userService.userProfileWithActions.requiredActions.length === 0) {
      this.router.navigate(['/']);
    }

    this.userService.userProfileWithActions.requiredActions.map((action) => {
      this.form.addControl(action, new FormControl('', Validators.required));
    });
  }

  onFormSubmit() {
    const completeUserProfileType: CompleteUserProfileType = {};

    this.userService.userProfileWithActions.requiredActions.map((action) => {
      const actionFormValue = this.form.get(action)?.value;
      completeUserProfileType[action.toLowerCase()] = actionFormValue;
    });

    this.userService
      .completeUserProfile(completeUserProfileType)
      .subscribe(() => {
        this.router.navigate(['/']).then(() => {
          this.userService.init();
        });
      });
  }

  protected readonly RequiredActionsEnum = RequiredActionsEnum;
}
