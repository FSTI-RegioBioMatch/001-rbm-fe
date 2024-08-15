interface Offer {
    address: {
      lat: number;
      lon: number;
      city: string;
    };
    company: {
      name: string;
      label: string;
    };
    product: {
      dateStart: string;
      dateEnd: string;
      unit: string;
      totalAmount: number;
    };
  }