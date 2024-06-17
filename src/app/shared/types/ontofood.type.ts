export type OntofoodType = {
  label: string;
  company: boolean;
  market: boolean;
  links: {
    self: string;
    supercategories: Array<string>;
    subcategories: Array<any>;
  };
};
