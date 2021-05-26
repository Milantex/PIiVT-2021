import CategoryModel from '../../../03-back-end/src/components/category/model';
import api from '../api/api';

export default class CategoryService {
    public static getTopLevelCategories(): Promise<CategoryModel[]> {
        return new Promise<CategoryModel[]>(resolve => {
            api("get", "/category", "user")
            .then(res => {
                if (res?.status !== "ok") {
                    // emit event
                    return resolve([]);
                }

                resolve(res.data as CategoryModel[]);
            });
        });
    }

    public static getCategoryById(categoryId: number): Promise<CategoryModel|null> {
        return new Promise<CategoryModel|null>(resolve => {
            api("get", "/category/" + categoryId, "user")
            .then(res => {
                if (res?.status !== "ok") {
                    // emit event
                    return resolve(null);
                }

                resolve(res.data as CategoryModel);
            });
        });
    }
}
