import { Ingredient } from './recipe.type';

export interface ShoppingListType {
  id?: string;
  companyId?: string;
  ingredients: Ingredient[];
  createdAt: string;
}
