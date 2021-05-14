import CategoryModel from './model';
import IModelAdapterOptions from '../../common/IModelAdapterOptions.interface';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IAddCategory } from './dto/AddCategory';
import BaseService from '../../services/BaseService';
import { IEditCategory } from './dto/EditCategory';

class CategoryModelAdapterOptions implements IModelAdapterOptions {
    loadParentCategory: boolean = false;
    loadSubcategories: boolean = false;
}

class CategoryService extends BaseService<CategoryModel> {
    protected async adaptModel(
        row: any,
        options: Partial<CategoryModelAdapterOptions> = { }
    ): Promise<CategoryModel> {
        const item: CategoryModel = new CategoryModel();

        item.categoryId = +(row?.category_id);
        item.name = row?.name;
        item.imagePath = row?.image_path;
        item.parentCategoryId = row?.parent__category_id;

        if (options.loadParentCategory && item.parentCategoryId !== null) {
            const data = await this.getById(item.parentCategoryId);

            if (data instanceof CategoryModel) {
                item.parentCategory = data;
            }
        }

        if (options.loadSubcategories) {
            const data = await this.getAllByParentCategoryId(
                item.categoryId,
                {
                    loadSubcategories: true,
                }
            );

            if (Array.isArray(data)) {
                item.subcategories = data;
            }
        }

        return item;
    }

    public async getAll(
        options: Partial<CategoryModelAdapterOptions> = { },
    ): Promise<CategoryModel[]|IErrorResponse> {
        return await this.getAllByFieldNameFromTable<CategoryModelAdapterOptions>(
            'category',
            'parent__category_id',
            null,
            options,
        );
    }

    public async getAllByParentCategoryId(
        parentCategoryId: number,
        options: Partial<CategoryModelAdapterOptions> = { },
    ): Promise<CategoryModel[]|IErrorResponse> {
        return await this.getAllByFieldNameFromTable<CategoryModelAdapterOptions>(
            'category',
            'parent__category_id',
            parentCategoryId,
            options,
        );
    }

    public async getById(
        categoryId: number,
        options: Partial<CategoryModelAdapterOptions> = { },
    ): Promise<CategoryModel|null|IErrorResponse> {
        return await this.getByIdFromTable<CategoryModelAdapterOptions>(
            "category",
            categoryId,
            options,
        );
    }

    public async add(data: IAddCategory): Promise<CategoryModel|IErrorResponse> {
        return new Promise<CategoryModel|IErrorResponse>(async resolve => {
            const sql = `
                INSERT
                    category
                SET
                    name = ?,
                    image_path = ?,
                    parent__category_id = ?;`;

            this.db.execute(sql, [ data.name, data.imagePath, data.parentCategoryId ?? null ])
                .then(async result => {
                    // const [ insertInfo ] = result;
                    const insertInfo: any = result[0];

                    const newCategoryId: number = +(insertInfo?.insertId);
                    resolve(await this.getById(newCategoryId));
                })
                .catch(error => {
                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                });
        });
    }

    public async edit(
        categoryId: number,
        data: IEditCategory,
        options: Partial<CategoryModelAdapterOptions> = { },
    ): Promise<CategoryModel|IErrorResponse|null> {
        const result = await this.getById(categoryId);

        if (result === null) {
            return null;
        }

        if (!(result instanceof CategoryModel)) {
            return result;
        }

        return new Promise<CategoryModel|IErrorResponse>(async resolve => {
            const sql = `
                UPDATE
                    category
                SET
                    name = ?,
                    image_path = ?
                WHERE
                    category_id = ?;`;

            this.db.execute(sql, [ data.name, data.imagePath, categoryId ])
                .then(async result => {
                    resolve(await this.getById(categoryId, options));
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

export default CategoryService;
