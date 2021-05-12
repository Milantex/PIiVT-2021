import * as express from "express";
import IApplicationResources from './common/IApplicationResources.interface';
import IRouter from './common/IRouter.interface';

export default class Router {
    static setupRoutes(application: express.Application, resources: IApplicationResources, routers: IRouter[]) {
        for (const router of routers) {
            router.setupRoutes(application, resources);
        }
    }
}
