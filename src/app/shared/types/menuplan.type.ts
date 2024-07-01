import { RecipeType } from './recipe.type';

export interface MenuplanType {
  id?: string;
  companyId?: string;
  description: string;
  menuName: string;
  weekDay: string;
  executionWeekNumber: number;
  place: string;
  portions: number;
  recipes: RecipeType[];
}
