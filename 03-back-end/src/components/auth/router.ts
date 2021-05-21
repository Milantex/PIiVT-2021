import * as express from "express";
import AuthController from './controller';
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';

export default class AuthRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        const authController: AuthController = new AuthController(resources);

        application.post("/auth/user/login",            authController.userLogin.bind(authController));
        application.post("/auth/administrator/login",   authController.administratorLogin.bind(authController));
    }
}
