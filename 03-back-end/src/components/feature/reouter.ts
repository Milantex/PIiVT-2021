import * as express from "express";
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';
import FeatureService from './service';
import FeatureController from './controller';

export default class FeatureRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        const featureService: FeatureService = new FeatureService(resources.databaseConnection);
        const featureController: FeatureController = new FeatureController(featureService);

        application.get("/feature/:id",           featureController.getById.bind(featureController));
        application.get("/category/:cid/feature", featureController.getAllInCategory.bind(featureController));
        application.post("/feature",              featureController.add.bind(featureController));
        application.put("/feature/:id",           featureController.edit.bind(featureController));
    }
}
