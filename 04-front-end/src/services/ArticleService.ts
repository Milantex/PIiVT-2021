import ArticleModel, { ArticlePrice } from '../../../03-back-end/src/components/article/model';
import api, { apiAsForm } from '../api/api';
import EventRegister from '../api/EventRegister';
import * as path from "path";

export interface IAddArticle {
    title: string;
    excerpt: string;
    description: string;
    isPromoted: 0 | 1;
    categoryId: number;
    price: number;

    features: Map<number, string>;

    images: File[];
}

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

    public static addArticle(data: IAddArticle): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const features: {
                featureId: number;
                value: string;
            }[] = [];

            data.features.forEach((value, key) => {
                features.push({
                    featureId: key,
                    value: value,
                });
            });

            const formData = new FormData();
            formData.append("data", JSON.stringify({
                title: data.title,
                excerpt: data.excerpt,
                description: data.description,
                isActive: true,
                isPromoted: data.isPromoted === 1,
                price: data.price,
                categoryId: data.categoryId,
                features: features,
            }));

            for (let image of data.images) {
                formData.append("image", image);
            }

            apiAsForm("post", "/article", "administrator", formData)
            .then(res => {
                if (res?.status !== "ok") {
                    if (res.status === "login") EventRegister.emit("AUTH_EVENT", "force_login");

                    return resolve(false);
                }

                resolve(true);
            });
        });
    }

    public static getThumbPath(url: string): string {
        const directory = path.dirname(url);
        const extension = path.extname(url);
        const filename  = path.basename(url, extension);
        return directory + "/" + filename + "-thumb" + extension;
    }

    public static getSmallPath(url: string): string {
        const directory = path.dirname(url);
        const extension = path.extname(url);
        const filename  = path.basename(url, extension);
        return directory + "/" + filename + "-small" + extension;
    }

    public static getPriceBefore(article: ArticleModel, date: string): number {
        const prices: ArticlePrice[] = article.prices;

        if (prices === undefined) {
            return article.currentPrice;
        }

        if (prices.length === 0) {
            return article.currentPrice;
        }

        let p = prices[0].price;

        const orderDate = new Date(date).getTime();

        for (let price of prices) {
            if (new Date(price.createdAt + "").getTime() <= orderDate) {
                p = price.price;
            } else {
                break;
            }
        }

        return p;
    }
}
