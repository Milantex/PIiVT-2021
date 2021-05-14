import FeatureService from './service';
import { Request, Response, NextFunction } from 'express';
import FeatureModel from './model';
import { IAddFeature, IAddFeatureValidator } from './dto/AddFeature';
import { IEditFeature, IEditFeatureValidator } from './dto/EditFeature';

class FeatureController {
    private featureService: FeatureService;

    constructor(featureService: FeatureService) {
        this.featureService = featureService;
    }

    public async getById(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id;

        const featureId: number = +id;

        if (featureId <= 0) {
            res.sendStatus(400);
            return;
        }

        const result = await this.featureService.getById(featureId, {
            loadCategory: true,
        });

        if (result === null) {
            res.sendStatus(404);
            return;
        }

        if (result instanceof FeatureModel) {
            res.send(result);
            return;
        }

        res.status(500).send(result);
    }

    public async getAllInCategory(req: Request, res: Response, next: NextFunction) {
        const categoryId: number = +(req.params.cid);
        res.send(await this.featureService.getAllByCategoryId(categoryId));
    }

    public async add(req: Request, res: Response) {
        if (!IAddFeatureValidator(req.body)) {
            res.status(400).send(IAddFeatureValidator.errors);
            return;
        }

        res.send(await this.featureService.add(req.body as IAddFeature));
    }

    public async edit(req: Request, res: Response) {
        const featureId = +(req.params.id);

        if (featureId <= 0) {
            res.sendStatus(400);
            return;
        }

        if (!IEditFeatureValidator(req.body)) {
            res.status(400).send(IEditFeatureValidator.errors);
            return;
        }

        const result = await this.featureService.getById(featureId);

        if (result === null) {
            res.sendStatus(404);
            return;
        }

        if (!(result instanceof FeatureModel)) {
            res.status(500).send(result);
            return;
        }

        res.send(await this.featureService.edit(featureId, req.body as IEditFeature, {
            loadCategory: true,
        }));
    }
}

export default FeatureController;
