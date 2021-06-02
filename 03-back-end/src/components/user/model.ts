import IModel from '../../common/IModel.interface';

export default class UserModel implements IModel {
    userId: number;
    createdAt: Date;
    email: string;
    passwordHash: string;
    passwordResetCode?: string|null = null;
    forename: string;
    surname: string;
    phoneNumber: string;
    postalAddress: string;
    isActive: boolean;
}
