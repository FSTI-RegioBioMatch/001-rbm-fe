export interface ProductType {
  dateStart: string;
  dateEnd: string;
  unit: string;
  totalAmount: number;
  isPermanent: boolean;
  category: Category;
  offerDetail: OfferDetail;
  company?: string;
}

export interface Category {
  label: string;
  company: boolean;
  market: boolean;
  links: Links;
}

export interface Links {
  self: string;
  supercategories: string[];
  subcategories: any[];
}

export interface OfferDetail {
  id: string;
  description: string;
  dateFrom: string;
  dateEnd: string;
  totalAmount: TotalAmount;
  minAmount: MinAmount;
  pricePerUnit: any;
  graduatedPrices: any[];
  links: Links2;
  levelsOfProcessing: any[];
  dateCreated: string;
  dateModified: string;
  active: boolean;
  isDeleted: boolean;
  isPermanent: boolean;
}

export interface TotalAmount {
  amount: number;
  unit: string;
}

export interface MinAmount {
  amount: number;
  unit: string;
}

export interface Links2 {
  self: string;
  update: string;
  remove: string;
  company: string;
  category: string;
  contact: string;
  latestTradeItem: any;
}
