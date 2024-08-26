export interface UserType {
  id: string;
  email: string;
  address: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  county: string;
  firstName: string;
  firstVisit: boolean;
  lastName: string;
  password: string;
  phoneNumber: string;
  zip: string;
  profileComplete: boolean;
  username: string;
  role: 'gastronom' | 'erzeuger' | 'veredler';
  privacyPolicy: boolean;
}
