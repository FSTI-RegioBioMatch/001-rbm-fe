import { ControlValueAccessor, FormControl } from '@angular/forms';
import { MyErrorStateMatcher } from './rbm-input/rbm-input.component';
import { Input } from '@angular/core';

export abstract class UiLogicAbstract implements ControlValueAccessor {
  private _form!: FormControl;
  matcher = new MyErrorStateMatcher();

  value: string = '';

  protected constructor() {}

  onChange: any = () => {};
  onTouch: any = () => {};

  set logicForm(form: FormControl) {
    this._form = form;
  }

  get logicForm() {
    return this._form;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  updateValue(val: any) {
    console.log(this._form);
    console.log(val);
    if (val.target.value) {
      this.value = val.target.value;
      this.onChange(val.target.value);
      this.onTouch();
    } else {
      this.value = val;
      this.onChange(val);
      this.onTouch();
    }
  }

  onInputFocus() {
    this._form?.markAsTouched();
  }
}
