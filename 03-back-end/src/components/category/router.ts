import * as express from "express";
import CategoryService from './service';
import CategoryController from './controller';

export default class CategoryRouter {
    public static setupRoutes(application: express.Application) {
        const categoryService: CategoryService = new CategoryService();
        const categoryController: CategoryController = new CategoryController(categoryService);

        application.get("/category",        categoryController.getAll.bind(categoryController));
        application.get("/category/:id",    categoryController.getById.bind(categoryController));
    }
}
