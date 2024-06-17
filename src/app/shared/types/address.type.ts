export interface AddressType {
  id: string;
  city: string;
  lat: number;
  links: {
    self: string;
    update: string;
    remove: string;
    company: string;
  };
  lon: number;
  street: string;
  name: string;
  suffix: string;
  zipcode: string;
  type: string;
}
