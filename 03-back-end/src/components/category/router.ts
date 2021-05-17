import * as express from "express";
import CategoryController from './controller';
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';

export default class CategoryRouter implements IRouter {
    public setupRoutes(application: express.Application, resources: IApplicationResources) {
        const categoryController: CategoryController = new CategoryController(resources);

        application.get("/category",        categoryController.getAll.bind(categoryController));
        application.get("/category/:id",    categoryController.getById.bind(categoryController));
        application.post("/category",       categoryController.add.bind(categoryController));
        application.put("/category/:id",    categoryController.edit.bind(categoryController));
        application.delete("/category/:id", categoryController.deleteById.bind(categoryController));
    }
}
