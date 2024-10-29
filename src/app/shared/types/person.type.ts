import { MessageTermsStatusEnum } from '../enums/message-terms-status.enum';

export interface PersonType {
  firstname: string;
  lastname: string;
  email: string;
  messageTermsStatus: MessageTermsStatusEnum;
  links: {
    self: string;
    update: string;
    remove: string;
  };
  language: string;
  tackingEnabled: boolean
}
