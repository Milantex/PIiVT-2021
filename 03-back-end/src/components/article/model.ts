import IModel from "../../common/IModel.interface";
import CategoryModel from "../category/model";

class Price implements IModel {
    priceId: number;
    price: number;
    createdAt: Date;
}

class Photo implements IModel {
    photoId: number;
    imagePath: string;
}

class FeatureValue implements IModel {
    featureId: number;
    name?: string;
    value: string;
}

class ArticleModel implements IModel {
    articleId: number;
    createdAt: Date;
    title: string;
    excerpt: string;
    description: string;
    isActive: boolean;
    isPromoted: boolean;
    categoryId: number;
    category?: CategoryModel;
    currentPrice: number;
    prices: Price[] = [];
    photos: Photo[] = [];
    features: FeatureValue[] = [];
}

export default ArticleModel;

export { Price as ArticlePrice };
export { Photo as ArticlePhoto };
export { FeatureValue as ArticleFeatureValue };

/*
export {
    Price as ArticlePrice,
    Photo as ArticlePhoto,
    FeatureValue as ArticleFeatureValue,
};
*/
