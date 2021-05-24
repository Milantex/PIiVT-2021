import * as express from "express";
import CategoryController from './controller';
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class CategoryRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        const categoryController: CategoryController = new CategoryController(resources);

        application.get(
            "/category",
            AuthMiddleware.getVerifier("administrator", "user"),
            categoryController.getAll.bind(categoryController)
        );

        application.get(
            "/category/:id",
            AuthMiddleware.getVerifier("administrator", "user"),
            categoryController.getById.bind(categoryController)
        );

        application.post("/category",
            AuthMiddleware.getVerifier("administrator"),
            categoryController.add.bind(categoryController)
        );

        application.put(
            "/category/:id",
            AuthMiddleware.getVerifier("administrator"),
            categoryController.edit.bind(categoryController)
        );

        application.delete(
            "/category/:id",
            AuthMiddleware.getVerifier("administrator"),
            categoryController.deleteById.bind(categoryController)
        );
    }
}
