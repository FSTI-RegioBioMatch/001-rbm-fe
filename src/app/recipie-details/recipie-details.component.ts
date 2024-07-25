import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-recipie-details',
  standalone: true,
  templateUrl: './recipie-details.component.html',
  styleUrls: ['./recipie-details.component.scss'],
  imports: [
    CommonModule,
  ],
})
export class RecipieDetailsComponent {
  data = {
    "steps": [
      {
        "schritt": "step 1",
        "anleitung": "mach ganz viel",
        "images": [
          "data:image/png;base64,i",
          "data:image/jpeg;base64,i"
        ]
      },
      {
        "schritt": "zweiter step",
        "anleitung": "schneiden",
        "images": [
          "data:image/png;base64,i"
        ]
      },
      {
        "schritt": "braten",
        "anleitung": "MACH HEISS YOOO",
        "images": []
      }
    ],
    "ingredients": [
      {
        "name": "zutat 1",
        "amount": "1",
        "unit": "l",
        "optional": false,
        "note": "zutat 1 notiz",
        "alternatives": [
          {
            "name": "zutat1-alt1",
            "amount": "11",
            "unit": "g"
          },
          {
            "name": "zutat1-alt2",
            "amount": "12",
            "unit": "kg"
          }
        ]
      },
      {
        "name": "zutat 2",
        "amount": "2",
        "unit": "l",
        "optional": false,
        "note": "",
        "alternatives": [
          {
            "name": "z2a1",
            "amount": "21",
            "unit": "l"
          }
        ]
      }
    ],
    "energie": "eincal",
    "portionen": "90",
    "besonderheiten": "ich nicht :(",
    "essensgaeste": "children",
    "allergene": "dairy",
    "saison": "autumn",
    "recipeName": "name",
    "recipeDescription": "desc",
    "diets": [
      "vegan"
    ],
    "recipeImage": "data:image/png;base64,i"
  };
}
