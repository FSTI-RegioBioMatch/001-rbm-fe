export interface OfferDetailedType {
  id: string;
  description: string;
  dateFrom: string;
  dateEnd: string;
  totalAmount: TotalAmount;
  minAmount: MinAmount;
  pricePerUnit: number;
  graduatedPrices: any[];
  links: Links;
  levelsOfProcessing: LevelsOfProcessing[];
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

export interface Links {
  self: string;
  update: string;
  remove: string;
  company: string;
  category: string;
  contact: string;
  latestTradeItem: any;
}

export interface LevelsOfProcessing {
  label: string;
  links: Links2;
}

export interface Links2 {
  self: string;
  excludedLops: any;
}
