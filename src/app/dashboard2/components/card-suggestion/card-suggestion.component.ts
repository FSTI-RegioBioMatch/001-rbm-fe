import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlannerService } from '../../../shared/services/planner.service';
import { Button } from 'primeng/button';
import { JsonPipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { PlannerDTO } from './types/planner.type';

@Component({
  selector: 'app-card-suggestion',
  standalone: true,
  imports: [ReactiveFormsModule, Button, JsonPipe, BadgeModule],
  templateUrl: './card-suggestion.component.html',
  styleUrl: './card-suggestion.component.scss',
})
export class CardSuggestionComponent {
  formGroup: FormGroup;
  loading = false;

  data: any = {};
  constructor(private plannerService: PlannerService) {
    this.formGroup = new FormGroup({
      bearerToken: new FormControl(''),
      lat1: new FormControl('47.59868101936087'),
      lon1: new FormControl('7.415771484375001'),
      lat2: new FormControl('51.590654219587314'),
      lon2: new FormControl('10.426025390625002'),
      currentCompanyId: new FormControl('3df70cd1-8472-49c2-81c4-565ddfac7c4a'),
      useNearbuyProd: new FormControl(true),
    });
  }

  startPlanning() {
    console.log('bearerToken', this.formGroup.value.bearerToken);
    this.loading = true;

    const plannerDTO: PlannerDTO = {
      lat1: this.formGroup.value.lat1,
      lon1: this.formGroup.value.lon1,
      lat2: this.formGroup.value.lat2,
      lon2: this.formGroup.value.lon2,
      currentCompanyId: this.formGroup.value.currentCompanyId,
      useProdAPIEndpoint: this.formGroup.value.useNearbuyProd,
    };

    this.plannerService
      .startPlanning(this.formGroup.value.bearerToken, plannerDTO)
      .subscribe((data) => {
        console.log(data);
        this.loading = false;
        this.data = data;
      });
  }
}
