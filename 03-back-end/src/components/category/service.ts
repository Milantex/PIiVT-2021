import CategoryModel from './model';
import * as mysql2 from 'mysql2/promise';
import IModelAdapterOptions from '../../common/IModelAdapterOptions.interface';

class CategoryService {
    private db: mysql2.Connection;

    constructor(db: mysql2.Connection) {
        this.db = db;
    }

    protected async adaptModel(
        row: any,
        options: Partial<IModelAdapterOptions> = { loadParent: false, loadChildren: false }
    ): Promise<CategoryModel> {
        const item: CategoryModel = new CategoryModel();

        item.categoryId = +(row?.category_id);
        item.name = row?.name;
        item.imagePath = row?.image_path;
        item.parentCategoryId = row?.parent__category_id;

        if (options.loadParent && item.parentCategoryId !== null) {
            item.parentCategory = await this.getById(item.parentCategoryId);
        }

        if (options.loadChildren) {
            item.subcategories = await this.getAllByParentCategoryId(item.categoryId);
        }

        return item;
    }

    public async getAll(): Promise<CategoryModel[]> {
        const lista: CategoryModel[] = [];

        const sql: string = "SELECT * FROM category WHERE parent__category_id IS NULL;";
        const [ rows, columns ] = await this.db.execute(sql);

        if (Array.isArray(rows)) {
            for (const row of rows) {
                lista.push(
                    await this.adaptModel(
                        row, {
                            loadChildren: true,
                        },
                    )
                )
            }
        }

        return lista;
    }

    public async getAllByParentCategoryId(parentCategoryId: number): Promise<CategoryModel[]> {
        const lista: CategoryModel[] = [];

        const sql: string = "SELECT * FROM category WHERE parent__category_id = ?;";
        const [ rows, columns ] = await this.db.execute(sql, [ parentCategoryId ]);

        if (Array.isArray(rows)) {
            for (const row of rows) {
                lista.push(
                    await this.adaptModel(
                        row, {
                            loadChildren: true,
                        },
                    )
                )
            }
        }

        return lista;
    }

    public async getById(categoryId: number): Promise<CategoryModel|null> {
        const sql: string = "SELECT * FROM category WHERE category_id = ?;";
        const [ rows, columns ] = await this.db.execute(sql, [ categoryId ]);

        if (!Array.isArray(rows)) {
            return null;
        }

        if (rows.length === 0) {
            return null;
        }

        return await this.adaptModel(
            rows[0],
            {
                loadChildren: true,
                loadParent: true,
            }
        );
    }
}

export default CategoryService;
