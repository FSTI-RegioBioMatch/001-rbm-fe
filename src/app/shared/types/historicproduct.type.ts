import { OntofoodType } from './ontofood.type';

export type HistoricProductType = {
    address: {
        city: string;
        lat: number;
        lon: number;
      };
    company: {
      id: string;
      label: string;
      name: string;
      verified: boolean;
    };
    links: {
        address: string;
        category: string;
        company: string;
        offer: string;
        request: any;
      };
    product: {
      dateEnd: string;
      dateStart: string;
      isPermanent: boolean;
      totalAmount: number;
      unit: string;
    };
    resultType: string;
    roles: string[];
    ontoFoodType?: OntofoodType;
  };