import { Component, OnInit } from '@angular/core';
import { RbmInputComponent } from '../shared/components/ui/rbm-input/rbm-input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RbmCheckboxComponent } from '../shared/components/ui/rbm-checkbox/rbm-checkbox.component';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [RbmInputComponent, ReactiveFormsModule, RbmCheckboxComponent],
  templateUrl: './components.component.html',
  styleUrl: './components.component.scss',
})
export class ComponentsComponent implements OnInit {
  form: FormGroup;
  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
    });
  }

  get name() {
    return this.form.get('name') as FormControl;
  }

  onSubmit() {
    console.log(this.form);
  }

  ngOnInit(): void {
    this.name.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }
}
