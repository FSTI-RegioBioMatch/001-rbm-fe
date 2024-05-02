import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgForm,
  UntypedFormControl,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UiLogicAbstract } from '../ui-logic.abstract';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-rbm-input',
  standalone: true,
  imports: [MatFormField, MatLabel, MatInput, MatError, FormsModule],
  templateUrl: './rbm-input.component.html',
  styleUrl: './rbm-input.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RbmInputComponent),
      multi: true,
    },
  ],
})
export class RbmInputComponent extends UiLogicAbstract {
  @Input() label!: string;
  @Input() placeholder!: string;
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() isRequired: boolean = false;
  @Input() elementName!: string;

  @Input() set form(form: UntypedFormControl) {
    this.logicForm = form;
  }

  constructor() {
    super();
  }
}
