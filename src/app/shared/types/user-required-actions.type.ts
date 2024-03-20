import { UserType } from './user.type';
import { RequiredActionsEnum } from '../enums/required-actions.enum';

export interface UserRequiredActionsType {
  userModel: UserType;
  requiredActions: RequiredActionsEnum[];
}
