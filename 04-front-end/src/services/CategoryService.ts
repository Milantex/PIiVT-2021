import CategoryModel from '../../../03-back-end/src/components/category/model';
import api from '../api/api';
import EventRegister from '../api/EventRegister';
import { ApiRole } from '../api/api';

export default class CategoryService {
    public static getTopLevelCategories(role: ApiRole = "user"): Promise<CategoryModel[]> {
        return new Promise<CategoryModel[]>(resolve => {
            api("get", "/category", role)
            .then(res => {
                if (res?.status !== "ok") {
                    if (res.status === "login") {
                        EventRegister.emit("AUTH_EVENT", "force_login");
                    }
                    return resolve([]);
                }

                resolve(res.data as CategoryModel[]);
            });
        });
    }

    public static getCategoryById(categoryId: number, role: ApiRole = "user"): Promise<CategoryModel|null> {
        return new Promise<CategoryModel|null>(resolve => {
            api("get", "/category/" + categoryId, role)
            .then(res => {
                if (res?.status !== "ok") {
                    if (res.status === "login") {
                        EventRegister.emit("AUTH_EVENT", "force_login");
                    }
                    return resolve(null);
                }

                resolve(res.data as CategoryModel);
            });
        });
    }
}
