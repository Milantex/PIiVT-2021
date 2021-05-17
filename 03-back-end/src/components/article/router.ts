import { Application } from 'express';
import IRouter from '../../../dist/common/IRouter.interface';
import IApplicationResources from '../../common/IApplicationResources.interface';
import ArticleController from './controller';

export default class ArticleRouter implements IRouter {
    public setupRoutes(application: Application, resources: IApplicationResources) {
        // Controller:
        const articleController = new ArticleController(resources);

        // Routing:
        application.get('/article/:id', articleController.getById.bind(articleController));
    }
}
