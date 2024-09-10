import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { CompanyType } from '../../../shared/types/company.type';
import { PersonType } from '../../../shared/types/person.type';

@Component({
  selector: 'app-card-company',
  standalone: true,
  imports: [CardModule, AvatarModule, Button],
  templateUrl: './card-company.component.html',
  styleUrl: './card-company.component.scss',
})
export class CardCompanyComponent {
  @Input() company!: CompanyType | null;
  @Input() person!: PersonType | null;
}
