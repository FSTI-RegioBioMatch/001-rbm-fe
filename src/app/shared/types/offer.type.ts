import { OntofoodType } from './ontofood.type';

export type OfferType = {
  resultType: string;
  company: {
    id: string;
    name: string;
    label: string;
    verified: boolean;
  };
  address: {
    lat: number;
    lon: number;
    city: string;
  };
  roles: string[];
  product: {
    dateStart: string;
    dateEnd: string;
    unit: string;
    totalAmount: number;
  };
  links: {
    company: string;
    offer: string;
    request: any;
    address: string;
    category: string;
  };
  ontoFoodType?: OntofoodType;
};