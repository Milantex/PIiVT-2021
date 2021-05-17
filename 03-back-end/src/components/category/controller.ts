import {Request, Response, NextFunction} from "express";
import CategoryModel from './model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IAddCategory, IAddCategoryValidator } from './dto/AddCategory';
import { IEditCategory, IEditCategoryValidator } from './dto/EditCategory';
import BaseController from '../../common/BaseController';

class CategoryController extends BaseController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        const categories = await this.services.categoryService.getAll({
            loadSubcategories: true,
        });

        res.send(categories);
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id;

        const categoryId: number = +id;

        if (categoryId <= 0) {
            res.sendStatus(400);
            return;
        }

        const data: CategoryModel|null|IErrorResponse = await this.services.categoryService.getById(
            categoryId,
            {
                loadSubcategories: true,
                loadFeatures: true,
            }
        );

        if (data === null) {
            res.sendStatus(404);
            return;
        }

        if (data instanceof CategoryModel) {
            res.send(data);
            return;
        }

        res.status(500).send(data);
    }

    async add(req: Request, res: Response, next: NextFunction) {
        const data = req.body;

        if (!IAddCategoryValidator(data)) {
            res.status(400).send(IAddCategoryValidator.errors);
            return;
        }

        const result = await this.services.categoryService.add(data as IAddCategory);

        res.send(result);
    }

    async edit(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id;

        const categoryId: number = +id;

        if (categoryId <= 0) {
            res.status(400).send("Invalid ID number.");
            return;
        }

        const data = req.body;

        if (!IEditCategoryValidator(data)) {
            res.status(400).send(IEditCategoryValidator.errors);
            return;
        }

        const result = await this.services.categoryService.edit(
            categoryId,
            data as IEditCategory,
            {
                loadSubcategories: true,
            }
        );

        if (result === null) {
            res.sendStatus(404);
            return;
        }

        res.send(result);
    }

    async deleteById(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id;

        const categoryId: number = +id;

        if (categoryId <= 0) {
            res.status(400).send("Invalid ID number.");
            return;
        }

        res.send(await this.services.categoryService.delete(categoryId));
    }
}

export default CategoryController;
