export interface CompanyType {
  id: string;
  name: string;
  company: {
    id: string;
    label: string;
    name: string;
    verified: boolean;
  };
  address: {
    city: string;
    lat: number;
    lon: number;
  } | null;
  addresses: { self: string; type: string }[];
  links: {
    self: string;
    address: string | null;
    category: string | null;
    company: string;
    offer: string | null;
    request: string | null;
  };
  ontoFoodType: {
    company: boolean;
    label: string;
    links: {
      self: string;
    };
    subcategories: string[];
    supercategories: string[];
    market: boolean;
  };
  product: {
    dateStart: string;
    dateEnd: string;
    isPermanent: boolean;
    totalAmount: number;
    unit: string;
  };
  resultType: string;
  roles: string[];
}