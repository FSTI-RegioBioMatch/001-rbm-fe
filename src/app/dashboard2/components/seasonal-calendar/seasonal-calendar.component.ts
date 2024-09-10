import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';

interface Produce {
  name: string;
  type: 'fruit' | 'vegetable';
  seasons: number[];
}

@Component({
  selector: 'app-seasonal-calendar',
  standalone: true,
  imports: [DropdownModule, TableModule, FormsModule],
  templateUrl: './seasonal-calendar.component.html',
  styleUrl: './seasonal-calendar.component.scss',
})
export class SeasonalCalendarComponent implements OnInit {
  months!: SelectItem[];
  selectedMonth: number = new Date().getMonth();

  seasonalFruits: Produce[] = [];
  seasonalVegetables: Produce[] = [];

  produceData: Produce[] = [
    { name: 'Apfel', type: 'fruit', seasons: [1, 2, 3, 4, 9, 10, 11, 12] },
    { name: 'Erdbeere', type: 'fruit', seasons: [5, 6, 7, 8] },
    { name: 'Birne', type: 'fruit', seasons: [8, 9, 10, 11] },
    {
      name: 'Kartoffel',
      type: 'vegetable',
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    { name: 'Tomate', type: 'vegetable', seasons: [7, 8, 9, 10] },
    { name: 'Karotte', type: 'vegetable', seasons: [6, 7, 8, 9, 10, 11] },
    // Fügen Sie hier weitere Obst- und Gemüsesorten hinzu
  ];

  ngOnInit() {
    this.months = [
      { label: 'Januar', value: 0 },
      { label: 'Februar', value: 1 },
      { label: 'März', value: 2 },
      { label: 'April', value: 3 },
      { label: 'Mai', value: 4 },
      { label: 'Juni', value: 5 },
      { label: 'Juli', value: 6 },
      { label: 'August', value: 7 },
      { label: 'September', value: 8 },
      { label: 'Oktober', value: 9 },
      { label: 'November', value: 10 },
      { label: 'Dezember', value: 11 },
    ];

    this.updateProduceList();
  }

  updateProduceList() {
    this.seasonalFruits = this.produceData.filter(
      (item) =>
        item.type === 'fruit' && item.seasons.includes(this.selectedMonth + 1),
    );

    this.seasonalVegetables = this.produceData.filter(
      (item) =>
        item.type === 'vegetable' &&
        item.seasons.includes(this.selectedMonth + 1),
    );
  }
}
