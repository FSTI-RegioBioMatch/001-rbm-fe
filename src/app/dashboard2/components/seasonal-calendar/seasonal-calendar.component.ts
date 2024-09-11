import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { JsonPipe } from '@angular/common';

interface Produce {
  name: string;
  type: 'fruit' | 'vegetable';
  seasons: number[];
}

@Component({
  selector: 'app-seasonal-calendar',
  standalone: true,
  imports: [DropdownModule, TableModule, FormsModule, JsonPipe],
  templateUrl: './seasonal-calendar.component.html',
  styleUrl: './seasonal-calendar.component.scss',
})
export class SeasonalCalendarComponent implements OnInit {
  months!: SelectItem[];
  selectedMonth: number = new Date().getMonth();

  outputData: Produce[] = [];

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
    { name: 'Kirsche', type: 'fruit', seasons: [6, 7, 8] },
    { name: 'Pflaume', type: 'fruit', seasons: [8, 9, 10] },
    { name: 'Himbeere', type: 'fruit', seasons: [6, 7, 8, 9] },
    { name: 'Blaubeere', type: 'fruit', seasons: [7, 8, 9] },
    { name: 'Spargel', type: 'vegetable', seasons: [4, 5, 6] },
    { name: 'Kürbis', type: 'vegetable', seasons: [9, 10, 11] },
    { name: 'Kohlrabi', type: 'vegetable', seasons: [5, 6, 7, 8, 9, 10] },
    { name: 'Rosenkohl', type: 'vegetable', seasons: [9, 10, 11, 12, 1, 2] },
    { name: 'Grünkohl', type: 'vegetable', seasons: [11, 12, 1, 2] },
    { name: 'Rhabarber', type: 'vegetable', seasons: [4, 5, 6] },
    { name: 'Johannisbeere', type: 'fruit', seasons: [6, 7, 8] },
    { name: 'Stachelbeere', type: 'fruit', seasons: [6, 7, 8] },
    { name: 'Zwetschge', type: 'fruit', seasons: [8, 9, 10] },
    { name: 'Mirabelle', type: 'fruit', seasons: [8, 9] },
    { name: 'Quitte', type: 'fruit', seasons: [9, 10] },
    { name: 'Brombeere', type: 'fruit', seasons: [8, 9, 10] },
    { name: 'Heidelbeere', type: 'fruit', seasons: [7, 8, 9] },
    { name: 'Holunderbeere', type: 'fruit', seasons: [8, 9, 10] },
    { name: 'Zucchini', type: 'vegetable', seasons: [6, 7, 8, 9] },
    { name: 'Aubergine', type: 'vegetable', seasons: [7, 8, 9, 10] },
    { name: 'Paprika', type: 'vegetable', seasons: [7, 8, 9, 10] },
    { name: 'Brokkoli', type: 'vegetable', seasons: [6, 7, 8, 9, 10] },
    { name: 'Blumenkohl', type: 'vegetable', seasons: [6, 7, 8, 9] },
    { name: 'Spinat', type: 'vegetable', seasons: [4, 5, 9, 10] },
    { name: 'Feldsalat', type: 'vegetable', seasons: [9, 10, 11, 12, 1, 2, 3] },
    { name: 'Rote Bete', type: 'vegetable', seasons: [7, 8, 9, 10, 11] },
    { name: 'Pastinake', type: 'vegetable', seasons: [9, 10, 11, 12, 1, 2, 3] },
    { name: 'Fenchel', type: 'vegetable', seasons: [6, 7, 8, 9, 10, 11] },
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
    this.outputData = this.produceData.filter((item) =>
      item.seasons.includes(this.selectedMonth + 1),
    );
  }
}
