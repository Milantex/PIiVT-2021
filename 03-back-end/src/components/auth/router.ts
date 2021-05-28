import * as express from "express";
import AuthController from './controller';
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class AuthRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        const authController: AuthController = new AuthController(resources);

        application.post("/auth/user/login",            authController.userLogin.bind(authController));
        application.post("/auth/administrator/login",   authController.administratorLogin.bind(authController));

        application.post("/auth/user/refresh",          authController.userRefresh.bind(authController));
        application.post("/auth/administrator/refresh", authController.administratorRefresh.bind(authController));
 
        application.get(
            "/auth/user/ok",
            AuthMiddleware.getVerifier("user"),
            authController.sendOk.bind(authController)
        );

        application.get(
            "/auth/administrator/ok",
            AuthMiddleware.getVerifier("administrator"),
            authController.sendOk.bind(authController)
        );
    }
}
