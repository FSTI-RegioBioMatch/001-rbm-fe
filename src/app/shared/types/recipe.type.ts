export interface RecipeType {
  id?: string;
  imageUrls: string[];
  ingredients: Ingredient[];
  portions: number;
  title: string;
  description: Description[];
  companyId?: string;
  public: boolean;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Description {
  step: number;
  title: string;
  description: string;
}
