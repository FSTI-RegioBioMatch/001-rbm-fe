import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuplanService } from '../shared/services/menuplan.service';
import { MenuplanType } from '../shared/types/menuplan.type';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-menu-plans',
  standalone: true,
  imports: [RouterLink, JsonPipe],
  templateUrl: './menu-plans.component.html',
  styleUrl: './menu-plans.component.scss',
})
export class MenuPlansComponent implements OnInit {
  @ViewChild('menuPlanTable') table: any;

  menuPlans: MenuplanType[] = [];
  rows: MenuplanType[] = [];
  expanded: any = {};
  timeout: any;

  constructor(private menuPlanService: MenuplanService) {}

  ngOnInit(): void {}
}
