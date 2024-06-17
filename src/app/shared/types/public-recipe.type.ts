export type PublicRecipeType = {
  id: number;
  title: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  badges: {
    text: string;
    type: string;
  }[];
  instructions: string;
  portions: number;
  created_at: string;
};
