import IModel from '../../common/IModel.interface';
import UserModel from '../user/model';
import ArticleModel from '../article/model';

type OrderStatus = 'pending' | 'rejected' | 'accepted' | 'completed';

class OrderModel implements IModel {
    orderId: number;
    createdAt: Date;
    status: OrderStatus;
}

class CartArticleModel implements IModel {
    cartArticleId: number;
    quantity: number;
    articleId: number;
    article: ArticleModel;
}

export default class CartModel implements IModel {
    cartId: number;
    createdAt: Date;
    userId: number;
    user: UserModel;
    articles: CartArticleModel[] = [];
    order?: OrderModel|null = null;
}

export { CartArticleModel };
export { OrderModel };
export type { OrderStatus };
