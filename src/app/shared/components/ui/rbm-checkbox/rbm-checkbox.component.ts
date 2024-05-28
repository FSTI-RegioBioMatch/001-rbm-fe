import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-rbm-checkbox',
  standalone: true,
  imports: [MatFormFieldModule, MatCheckboxModule, FormsModule],
  templateUrl: './rbm-checkbox.component.html',
  styleUrls: ['./rbm-checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RbmCheckboxComponent),
      multi: true,
    },
  ],
})
export class RbmCheckboxComponent implements ControlValueAccessor {
  @Input() label!: string;
  @Input() isRequired: boolean = false;
  @Input() elementName!: string;
  @Input() form!: FormControl;
  @Input() value!: boolean;
  @Input() labelPosition: 'before' | 'after' = 'after';
  @Input() disabled = false;

  private isInternalChange = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: boolean): void {
    if (!this.isInternalChange) {
      this.value = value;
      this.form.setValue(value, { emitEvent: false });
    }
    this.isInternalChange = false;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onCheckboxValueChanged(value: any) {
    this.isInternalChange = true;
    this.writeValue(value.checked);
    this.onChange(value.checked);
    this.onTouched();
  }
}
