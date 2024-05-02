import { Component, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { RbmInputComponent } from '../rbm-input/rbm-input.component';
import { UiLogicAbstract } from '../ui-logic.abstract';
import { MatFormField } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-rbm-checkbox',
  standalone: true,
  imports: [MatFormField, MatCheckbox],
  templateUrl: './rbm-checkbox.component.html',
  styleUrl: './rbm-checkbox.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RbmInputComponent),
      multi: true,
    },
  ],
})
export class RbmCheckboxComponent extends UiLogicAbstract {
  constructor() {
    super();
  }
}
