import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { CommonModule, JsonPipe } from '@angular/common';
import { PixabayService } from '../../../shared/services/pixabay.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Produce {
  name: string;
  type: 'fruit' | 'vegetable';
  seasons: number[];
  imageUrl?: string;
}

@Component({
  selector: 'app-seasonal-calendar',
  standalone: true,
  imports: [DropdownModule, TableModule, FormsModule, JsonPipe, CommonModule],
  templateUrl: './seasonal-calendar.component.html',
  styleUrls: ['./seasonal-calendar.component.scss'],
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

  constructor(private pixabayService: PixabayService, private router: Router,private http: HttpClient) {}

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
    this.loadImagesForProduce(); 
  }
  loadImagesForProduce() {
    this.outputData.forEach((produce) => {
        this.pixabayService.searchImage(produce.name).subscribe({
            next: (response: any) => {
                if (response.hits && response.hits.length > 0) {
                    produce.imageUrl = response.hits[0].webformatURL;  // Set the first image URL
                } else {
                    produce.imageUrl = '';  // No image found
                    console.warn(`Kein Bild gefunden für ${produce.name}`);
                }
            },
            error: (error) => {
                console.error(`Fehler beim Abrufen des Bildes für ${produce.name}:`, error);
                produce.imageUrl = '';  // In case of an error, fallback to no image
            }
        });
    });
}
}
