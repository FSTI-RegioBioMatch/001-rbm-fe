export interface ShoppingList {
    id: string;
    name: string;
    createdAt: string;
    menuPlans: MenuPlan[];
    groupedShoppingList: { [key: string]: Ingredient[] };
  }
  
  export interface MenuPlan {
    id: string;
    name: string;
    recipes: Recipe[];
  }
  
  export interface Recipe {
    id: string;
    name: string;
  }
  
  export interface Ingredient {
    name: string;
    unit: string;
    totalAmount: number;
    sourceRecipes: string[];
    category: string;
    convertible: boolean;
    processingBreakdown: { [key: string]: number };
    totalInLargestUnit: string;
  }
  