import { Application } from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';
import ArticleController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';

export default class ArticleRouter implements IRouter {
    public setupRoutes(application: Application, resources: IApplicationResources) {
        // Controller:
        const articleController = new ArticleController(resources);

        // Routing:
        application.get(
            '/article/:id',
            AuthMiddleware.getVerifier("user", "administrator"),
            articleController.getById.bind(articleController)
        );

        application.post(
            '/article',
            AuthMiddleware.getVerifier("administrator"),
            articleController.add.bind(articleController)
        );

        application.put(
            '/article/:id',
            AuthMiddleware.getVerifier("administrator"),
            articleController.edit.bind(articleController)
        );

        application.delete(
            '/article/:id',
            AuthMiddleware.getVerifier("administrator"),
            articleController.delete.bind(articleController)
        );

        application.delete(
            '/article/:aid/photo/:pid',
            AuthMiddleware.getVerifier("administrator"),
            articleController.deleteArticlePhoto.bind(articleController)
        );

        application.post(
            '/article/:id/photo',
            AuthMiddleware.getVerifier("administrator"),
            articleController.addArticlePhotos.bind(articleController)
        );

        application.get(
            "/category/:id/article",
            AuthMiddleware.getVerifier("user", "administrator"),
            articleController.getAllByCategoryId.bind(articleController)
        );
    }
}
