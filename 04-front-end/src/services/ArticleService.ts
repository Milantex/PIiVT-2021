import ArticleModel from '../../../03-back-end/src/components/article/model';
import api from '../api/api';
import EventRegister from '../api/EventRegister';

export default class ArticleService {
    public static getArticleById(articleId: number): Promise<ArticleModel|null> {
        return new Promise<ArticleModel|null>(resolve => {
            api("get", "/article/" + articleId, "user")
            .then(res => {
                if (res?.status !== "ok") {
                    if (res.status === "login") {
                        EventRegister.emit("AUTH_EVENT", "force_login");
                    }
                    return resolve(null);
                }
                resolve(res.data as ArticleModel);
            });
        });
    }

    public static getArticlesByCategoryId(categoryId: number): Promise<ArticleModel[]> {
        return new Promise<ArticleModel[]>(resolve => {
            api("get", "/category/" + categoryId + "/article", "user")
            .then(res => {
                if (res?.status !== "ok") {
                    if (res.status === "login") {
                        EventRegister.emit("AUTH_EVENT", "force_login");
                    }
                    return resolve([]);
                }
                resolve(res.data as ArticleModel[]);
            });
        });
    }
}
