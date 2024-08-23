import { RecipeType } from "./recipe.type";

export interface MenuplanType {
  name: string;
  beschreibung: string;
  id: string;
  nachsteAusfuhrung: string;
  wochentag: string;
  wiederholung: string;
  ort: string;
  portions: number;
  portionsVegetarisch: number;
  portionsVegan: number;
  recipes: any[];
}
