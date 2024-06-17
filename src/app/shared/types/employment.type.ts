export interface EmploymentType {
  id: string;
  status: string;
  links: {
    self: string;
    update: string;
    remove: string;
    person: string;
    company: string;
    systemMessage: string;
  };
}
