export interface CompanyType {
  id: string;
  name: string;
  legalstatus: string;
  phone: string;
  email: string;
  web: string;
  fax: string;
  description: string;
  visibility: string;
  address: {
    lat: number;
    lon: number;
    city: string;
  };
  addresses: { self: string; type: string }[];
  taxId: string;
  mobile: string;
  labelName: string;
  verified: boolean;
  links: {
    self: string;
    update: string;
    remove: string;
    logo: string;
    verification: string;
    category: string;
  };
  tenant: string;
  product: {
    dateStart: string;
    dateEnd: string;
    unit: string;
    totalAmount: number;
  };
}
