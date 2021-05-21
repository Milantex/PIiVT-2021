import BaseController from '../../common/BaseController';
import { Request, Response } from "express";
import { IAddUser, IAddUserValidator } from './dto/IAddUser';
import { IEditUser, IEditUserValidator } from './dto/IEditUser';
import UserModel from './model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import * as nodemailer from "nodemailer";
import Config from '../../config/dev';

export default class UserController extends BaseController {
    public async getAll(req: Request, res: Response) {
        res.send(await this.services.userService.getAll());
    }

    public async getById(req: Request, res: Response) {
        const id = +(req.params.id);

        if (id <= 0) return res.status(400).send("The ID value cannot be smaller than 1.");

        const item = await this.services.userService.getById(id);

        if (item === null) return res.sendStatus(404);

        res.send(item);
    }

    public async add(req: Request, res: Response) {
        if (!IAddUserValidator(req.body)) {
            return res.status(400).send(IAddUserValidator.errors);
        }

        const result = await this.services.userService.add(req.body as IAddUser);

        res.send(result);
    }

    public async edit(req: Request, res: Response) {
        const id = +(req.params.id);

        if (id <= 0) return res.status(400).send("The ID value cannot be smaller than 1.");

        if (!IEditUserValidator(req.body)) {
            return res.status(400).send(IEditUserValidator.errors);
        }

        const result = await this.services.userService.edit(id, req.body as IEditUser);

        if (result === null) return res.sendStatus(404);

        res.send(result);
    }

    public async delete(req: Request, res: Response) {
        const id = +(req.params.id);

        if (id <= 0) return res.status(400).send("The ID value cannot be smaller than 1.");

        res.send(await this.services.userService.delete(id));
    }

    private async sendRegistrationEmail(data: UserModel): Promise<IErrorResponse> {
        return new Promise<IErrorResponse>(resolve => {
            const transport = nodemailer.createTransport(
                {
                    host: Config.mail.hostname,
                    port: Config.mail.port,
                    secure: Config.mail.secure,
                    auth: {
                        user: Config.mail.username,
                        pass: Config.mail.password,
                    },
                    debug: Config.mail.debug,
                },
                {
                    from: Config.mail.fromEmail,
                }
            );

            transport.sendMail({
                to: data.email,
                subject: "Account registration notification",
                html: `<!doctype html>
                        <html>
                            <head>
                                <meta charset="utf-8">
                            </head>
                            <body>
                                <p>
                                Dear ${data.forename} ${data.surname},<br>
                                Your account was successfully created.
                                </p>
                                <p>
                                    You can log in to the portal with your email and password.
                                </p>
                            </body>
                        </html>`,
            })
            .then(() => {
                transport.close();

                resolve({
                    errorCode: 0,
                    errorMessage: "",
                });
            })
            .catch(error => {
                transport.close();

                resolve({
                    errorCode: -1,
                    errorMessage: error?.message,
                });
            });
        });
    }

    public async register(req: Request, res: Response) {
        if (!IAddUserValidator(req.body)) {
            return res.status(400).send(IAddUserValidator.errors);
        }

        const result: UserModel|IErrorResponse = await this.services.userService.add(req.body as IAddUser);

        if (!(result instanceof UserModel)) {
            if (result.errorMessage.includes("uq_user_email")) {
                return res.status(400).send("An account with this email already exists.");
            }

            return res.status(400).send(result);
        }

        const mailResult = await this.sendRegistrationEmail(result);

        if (mailResult.errorCode !== 0) {
            // Write down into an error log...
            // Schedule e-mail sending at a later time...
        }

        res.send(result);
    }
}
