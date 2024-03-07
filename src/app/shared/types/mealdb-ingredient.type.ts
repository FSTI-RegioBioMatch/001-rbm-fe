export interface MealdbIngredientType {
  meals: Ingredient[];
}

export interface Ingredient {
  strIngredient: string;
  strDescription: string;
  strType: string;
  idIngredient: string;
}
