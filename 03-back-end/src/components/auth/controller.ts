import BaseController from '../../common/BaseController';
import { Request, Response } from "express";
import { IUserLogin, IUserLoginValidator } from './dto/IUserLogin';
import * as bcrypt from "bcrypt";
import ITokenData from './dto/ITokenData.interface';
import * as jwt from "jsonwebtoken";
import Config from '../../config/dev';
import { IAdministratorLogin, IAdministratorLoginValidator } from './dto/IAdministratorLogin';

export default class AuthController extends BaseController {
    public async userLogin(req: Request, res: Response) {
        if (!IUserLoginValidator(req.body)) {
            return res.status(400).send(IUserLoginValidator.errors);
        }

        const data = req.body as IUserLogin;

        const user = await this.services.userService.getByEmail(data.email);
        if (user === null) return res.sendStatus(404);

        if (!user.isActive) {
            return res.status(403).send("User account inactive.");
        }

        if (!bcrypt.compareSync(data.password, user.passwordHash)) {
            // Anti-brute-force mera: sacekati 1s pre slanja odgovora da lozinka nije dobra
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(403).send("Invalid user password.");
        }

        const authTokenData: ITokenData = {
            id: user.userId,
            identity: user.email,
            role: "user",
        };

        const refreshTokenData: ITokenData = {
            id: user.userId,
            identity: user.email,
            role: "user",
        };

        const authToken = jwt.sign(
            authTokenData,
            Config.auth.user.auth.private,
            {
                algorithm: Config.auth.user.algorithm,
                issuer: Config.auth.user.issuer,
                expiresIn: Config.auth.user.auth.duration,
            },
        );

        const refreshToken = jwt.sign(
            refreshTokenData,
            Config.auth.user.refresh.private,
            {
                algorithm: Config.auth.user.algorithm,
                issuer: Config.auth.user.issuer,
                expiresIn: Config.auth.user.refresh.duration,
            },
        );

        res.send({
            authToken: authToken,
            refreshToken: refreshToken,
        });
    }

    public async administratorLogin(req: Request, res: Response) {
        if (!IAdministratorLoginValidator(req.body)) {
            return res.status(400).send(IAdministratorLoginValidator.errors);
        }

        const data = req.body as IAdministratorLogin;

        const administrator = await this.services.administratorService.getByUsername(data.username);
        if (administrator === null) return res.sendStatus(404);

        if (!administrator.isActive) {
            return res.status(403).send("Administrator account inactive.");
        }

        if (!bcrypt.compareSync(data.password, administrator.passwordHash)) {
            // Anti-brute-force mera: sacekati 1s pre slanja odgovora da lozinka nije dobra
            await new Promise(resolve => setTimeout(resolve, 1000));
            return res.status(403).send("Invalid administrator password.");
        }

        const authTokenData: ITokenData = {
            id: administrator.administratorId,
            identity: administrator.username,
            role: "administrator",
        };

        const refreshTokenData: ITokenData = {
            id: administrator.administratorId,
            identity: administrator.username,
            role: "administrator",
        };

        const authToken = jwt.sign(
            authTokenData,
            Config.auth.administrator.auth.private,
            {
                algorithm: Config.auth.administrator.algorithm,
                issuer: Config.auth.administrator.issuer,
                expiresIn: Config.auth.administrator.auth.duration,
            },
        );

        const refreshToken = jwt.sign(
            refreshTokenData,
            Config.auth.administrator.refresh.private,
            {
                algorithm: Config.auth.administrator.algorithm,
                issuer: Config.auth.administrator.issuer,
                expiresIn: Config.auth.administrator.refresh.duration,
            },
        );

        res.send({
            authToken: authToken,
            refreshToken: refreshToken,
        });
    }
}
