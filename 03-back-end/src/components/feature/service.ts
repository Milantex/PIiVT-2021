import IModelAdapterOptionsInterface from '../../common/IModelAdapterOptions.interface';
import BaseService from '../../common/BaseService';
import FeatureModel from './model';
import { IAddFeature } from './dto/AddFeature';
import { IEditFeature } from './dto/EditFeature';
import CategoryModel from '../category/model';
import IErrorResponse from '../../common/IErrorResponse.interface';

class FeatureModelAdapterOptions implements IModelAdapterOptionsInterface {
    loadCategory: boolean = false;
}

class FeatureService extends BaseService<FeatureModel> {
    protected async adaptModel(
        data: any,
        options: Partial<FeatureModelAdapterOptions>
    ): Promise<FeatureModel> {
        const item: FeatureModel = new FeatureModel();

        item.featureId  = +(data?.feature_id);
        item.name       = data?.name;
        item.categoryId = +(data?.category_id);

        if (options.loadCategory && item.categoryId) {
            const result = await this.services.categoryService.getById(item.categoryId);
            item.category = result as CategoryModel;
        }

        return item;
    }

    public async getById(
        featureId: number,
        options: Partial<FeatureModelAdapterOptions> = { },
    ): Promise<FeatureModel|null|IErrorResponse> {
        return await this.getByIdFromTable("feature", featureId, options);
    }

    public async getAllByCategoryId(
        categoryId: number,
    ): Promise<FeatureModel[]> {
        const allFeatures: FeatureModel[] = [];

        let currentParent: CategoryModel|null = await this.services.categoryService.getById(categoryId) as CategoryModel;

        while (currentParent !== null) {
            allFeatures.push(
                ... await this.getAllByFieldNameFromTable(
                    "feature",
                    "category_id",
                    currentParent.categoryId,
                ) as FeatureModel[]
            );

            currentParent = await this.services.categoryService.getById(
                currentParent.parentCategoryId
            ) as CategoryModel | null;
        }

        return allFeatures;
    }

    public async add(data: IAddFeature): Promise<FeatureModel|IErrorResponse> {
        return new Promise<FeatureModel|IErrorResponse>(resolve => {
            const sql = "INSERT feature SET name = ?, category_id = ?;";
            this.db.execute(sql, [ data.name, data.categoryId ])
                .then(async result => {
                    const insertInfo: any = result[0];
                    const newId: number = +(insertInfo?.insertId);
                    resolve(await this.getById(newId));
                })
                .catch(error => {
                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                })
        });
    }

    public async edit(
        featureId: number,
        data: IEditFeature,
        options: Partial<FeatureModelAdapterOptions> = { },
    ): Promise<FeatureModel|IErrorResponse> {
        return new Promise<FeatureModel|IErrorResponse>(resolve => {
            const sql = "UPDATE feature SET name = ? WHERE feature_id = ?;";
            this.db.execute(sql, [ data.name, featureId ])
                .then(async result => {
                    resolve(await this.getById(featureId, options));
                })
                .catch(error => {
                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                })
        });
    }

    public async deleteById(featureId: number): Promise<IErrorResponse> {
        return new Promise<IErrorResponse>(async resolve => {
            const sql = "DELETE FROM feature WHERE feature_id = ?;";
            this.db.execute(sql, [ featureId ])
                .then(() => {
                    resolve({
                        errorCode: 0,
                        errorMessage: "Deleted.",
                    });
                })
                .catch(error => {
                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                });
        });
    }
}

export default FeatureService;
