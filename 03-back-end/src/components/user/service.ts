import UserModel from './model';
import IModelAdapterOptions from '../../common/IModelAdapterOptions.interface';
import BaseService from '../../common/BaseService';
import { IAddUser } from './dto/IAddUser';
import IErrorResponse from '../../common/IErrorResponse.interface';
import * as bcrypt from "bcrypt";
import { IEditUser } from './dto/IEditUser';

class UserModelAdapterOptions implements IModelAdapterOptions {
    loadOrders: boolean = false;
}

class UserService extends BaseService<UserModel> {
    protected async adaptModel(
        data: any,
        options: Partial<UserModelAdapterOptions>
    ): Promise<UserModel> {
        const item = new UserModel();

        item.userId            = +(data?.user_id);
        item.email             =   data?.email;
        item.createdAt         = new Date(data?.created_at);
        item.passwordHash      =   data?.password_hash;
        item.passwordResetCode =   data?.password_reset_code;
        item.forename          =   data?.forename;
        item.surname           =   data?.surname;
        item.phoneNumber       =   data?.phone_number;
        item.postalAddress     =   data?.postal_address;
        item.isActive          = +(data?.is_active) === 1;

        if (options.loadOrders) {
            // ...
        }

        return item;
    }

    public async getAll(): Promise<UserModel[]> {
        return await this.getAllFromTable("user", {}) as UserModel[];
    }

    public async getById(userId: number): Promise<UserModel|null> {
        return await this.getByIdFromTable("user", userId, {}) as UserModel|null;
    }

    public async getByEmail(email: string): Promise<UserModel|null> {
        const users = await this.getAllByFieldNameFromTable("user", "email", email, {});

        if (!Array.isArray(users) || users.length === 0) {
            return null;
        }

        return users[0];
    }

    public async add(data: IAddUser): Promise<UserModel|IErrorResponse> {
        return new Promise<UserModel|IErrorResponse>(async resolve => {
            const passwordHash = bcrypt.hashSync(data.password, 11);

            this.db.execute(
                `INSERT
                    user
                SET
                    email = ?,
                    password_hash = ?,
                    forename = ?,
                    surname = ?,
                    phone_number = ?,
                    postal_address = ?,
                    is_active = 1;`,
                [
                    data.email,
                    passwordHash,
                    data.forename,
                    data.surname,
                    data.phoneNumber,
                    data.postalAddress,
                ]
            )
            .then(async res => {
                const newUserId: number = +((res[0] as any)?.insertId);
                resolve(await this.getById(newUserId));
            })
            .catch(error => {
                resolve({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                });
            })
        });
    }

    public async edit(userId: number, data: IEditUser): Promise<UserModel|IErrorResponse|null> {
        return new Promise<UserModel|IErrorResponse|null>(async resolve => {
            const currentUser = await this.getById(userId);

            if (currentUser === null) {
                return resolve(null);
            }

            const passwordHash = bcrypt.hashSync(data.password, 11);

            this.db.execute(
                `UPDATE
                    user
                 SET
                    email = ?,
                    password_hash = ?,
                    forename = ?,
                    surname = ?,
                    phone_number = ?,
                    postal_address = ?,
                    is_active = ?
                 WHERE
                    user_id = ?;`,
                [
                    data.email,
                    passwordHash,
                    data.forename,
                    data.surname,
                    data.phoneNumber,
                    data.postalAddress,
                    data.isActive,
                    userId,
                ]
            )
            .then(async () => {
                resolve(await this.getById(userId));
            })
            .catch(error => {
                resolve({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                });
            })
        });
    }

    public async delete(userId: number): Promise<IErrorResponse> {
        return new Promise<IErrorResponse>(async resolve => {
            this.db.execute(
                `DELETE FROM user WHERE user_id = ?;`,
                [ userId, ]
            )
            .then(res => {
                resolve({
                    errorCode: 0,
                    errorMessage: `Deleted ${(res as any[])[0]?.affectedRows} records.`
                });
            })
            .catch(error => {
                resolve({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                });
            });
        });
    }
}

export default UserService;