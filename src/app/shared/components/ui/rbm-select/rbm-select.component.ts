import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

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
  selector: 'app-rbm-select',
  standalone: true,
  imports: [
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    FormsModule,
    ReactiveFormsModule,
    MatError,
  ],
  templateUrl: './rbm-select.component.html',
  styleUrl: './rbm-select.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RbmSelectComponent),
      multi: true,
    },
  ],
})
export class RbmSelectComponent implements ControlValueAccessor {
  @Input() label!: string;
  @Input() isRequired: boolean = false;
  @Input() values: any[] = [];
  @Input() form!: FormControl;
  @Input() elementName!: string;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.form.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSelectionChange(value: any) {
    this.writeValue(value);
    this.onChange(value);
    this.onTouched();
  }
}
