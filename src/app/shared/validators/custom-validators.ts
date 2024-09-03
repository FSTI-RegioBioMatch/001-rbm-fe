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
      const isValid = controlsNames.some(controlName => {
        const control = formGroup.get(controlName);
        return control && Number(control.value) > 0;
      });
  
      return isValid ? null : { atLeastOnePortion: true };
    };
  }

  static atLeastOneRecipe(menuPlan: () => any[]): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const recipes = menuPlan();
      return recipes.length > 0 ? null : { atLeastOneRecipe: true };
    };
  }  
}
