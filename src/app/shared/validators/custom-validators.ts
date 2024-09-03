import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class CustomValidators {

  /**
   * Validates that if there is content, it must be at least 1 character long.
   */
  static optionalMinLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      if (value && value.length < minLength) {
        return { optionalMinLength: { requiredLength: minLength, actualLength: value.length } };
      }
      return null;
    };
  }

  /**
   * Validates that at least one of the provided fields has a value greater than 0.
   * @param controlsNames The names of the controls to check.
   */
  static atLeastOnePortion(controlsNames: string[]): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      // Check if any of the relevant portion fields are touched or dirty
      const areRelevantFieldsInteracted = controlsNames.some(controlName => {
        const control = formGroup.get(controlName);
        return control && (control.dirty || control.touched);
      });
  
      // If none of the relevant fields are interacted with, don't show validation error
      if (!areRelevantFieldsInteracted) {
        return null;
      }
  
      // Check if at least one portion field has a value greater than 0
      const isValid = controlsNames.some(controlName => {
        const control = formGroup.get(controlName);
        return control && Number(control.value) > 0;
      });
  
      return isValid ? null : { atLeastOnePortion: true };
    };
  }
  
  
}
