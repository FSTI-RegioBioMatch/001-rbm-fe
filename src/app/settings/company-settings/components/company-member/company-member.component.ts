import { Component } from '@angular/core';
import { RbmInputComponent } from '../../../../shared/components/ui/rbm-input/rbm-input.component';
import { RbmSelectComponent } from '../../../../shared/components/ui/rbm-select/rbm-select.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-company-member',
  standalone: true,
  imports: [RbmInputComponent, RbmSelectComponent, ReactiveFormsModule],
  templateUrl: './company-member.component.html',
  styleUrl: './company-member.component.scss',
})
export class CompanyMemberComponent {
  constructor() {}
}
