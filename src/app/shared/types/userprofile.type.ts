import { CompanyType } from "./company.type";
import { EmploymentType } from "./employment.type";
import { PersonType } from "./person.type";

export interface UserProfile {
    person: PersonType;
    employments: EmploymentType[];
    companies: CompanyType [];
    companyIds: string[];
}