import { Application } from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import IRouter from '../../common/IRouter.interface';
import ArticleController from './controller';

export default class ArticleRouter implements IRouter {
    public setupRoutes(application: Application, resources: IApplicationResources) {
        // Controller:
        const articleController = new ArticleController(resources);

        // Routing:
        application.get('/article/:id', articleController.getById.bind(articleController));
        application.post('/article',    articleController.add.bind(articleController));
        application.put('/article/:id', articleController.edit.bind(articleController));
    }
}
