import BaseService from '../../common/BaseService';
import IModelAdapterOptionsInterface from '../../common/IModelAdapterOptions.interface';
import CartModel, { CartArticleModel, OrderModel } from './model';
import UserModel from '../user/model';
import ArticleModel from '../article/model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IOrderStatus } from './dto/IOrderStatus';
import { ArticleModelAdapterOptions } from '../article/service';

export class CartModelAdapterOptions implements IModelAdapterOptionsInterface {
    loadUser: boolean = false;
    loadArticles: boolean = false;
    loadOrder: boolean = false;

    articleModelAdapterOptions: ArticleModelAdapterOptions = {
        loadCategory: true,
        loadPrices: true,
        loadFeatures: true,
        loadPhotos: true,
    };
}

export default class CartService extends BaseService<CartModel> {
    protected async adaptModel(
        data: any,
        options: Partial<CartModelAdapterOptions>,
    ): Promise<CartModel> {
        const item = new CartModel();

        item.cartId    = +(data?.cart_id);
        item.createdAt = new Date(data?.created_at);
        item.userId    = +(data?.user_id);

        if (options.loadUser) {
            item.user = await this.services.userService.getById(item.userId) as UserModel;
        }

        if (options.loadOrder) {
            item.order = await this.getOrderByCartId(item.cartId);
        }

        if (options.loadArticles) {
            item.articles = await this.getAllCartArticlesByCartId(item.cartId, options.articleModelAdapterOptions);
        }

        return item;
    }
    
    private async getOrderByCartId(cartId: number): Promise<OrderModel | null> {
        const [ rows ] = await this.db.execute(
            `SELECT * FROM \`order\` WHERE cart_id = ?;`,
            [ cartId, ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }
        
        const order = rows[0] as any;

        return {
            orderId: +(order?.order_id),
            createdAt: new Date(order?.created_at),
            status: order?.status,
        }
    }

    private async getAllCartArticlesByCartId(cartId: number, articleModelAdapterOptions: ArticleModelAdapterOptions): Promise<CartArticleModel[]> {
        const [ rows ] = await this.db.execute(
            `SELECT * FROM cart_article WHERE cart_id = ?;`,
            [ cartId, ]
        );
        
        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        const items: CartArticleModel[] = [];

        for (const row of rows) {
            const data = row as any;

            const articleId = +(data?.article_id);

            items.push({
                cartArticleId: +(data?.cart_article_id),
                articleId: articleId,
                quantity: +(data?.quantity),
                article: await this.services.articleService.getById(articleId, articleModelAdapterOptions) as ArticleModel,
            });
        }

        return items;
    }

    public async getById(cartId: number, options: Partial<CartModelAdapterOptions> = {}): Promise<CartModel|null> {
        return await super.getByIdFromTable<CartModelAdapterOptions>("cart", cartId, options) as CartModel|null;
    }

    private async add(userId: number): Promise<CartModel|IErrorResponse> {
        return new Promise<CartModel|IErrorResponse>(async resolve => {
            this.db.execute(
                `INSERT cart SET user_id = ?;`,
                [ userId, ]
            )
            .then(async res => {
                const insertData = res[0] as any;
                const newCartId = +(insertData?.insertId);
                resolve(await this.getById(newCartId, {
                    loadUser: true,
                }));
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage,
                });
            });
        });
    }

    public async getAllCartsByUserId(userId: number, options: Partial<CartModelAdapterOptions> = {}): Promise<CartModel[]> {
        return await super.getAllByFieldNameFromTable<CartModelAdapterOptions>("cart", "user_id", userId, options) as CartModel[];
    }

    public async getLatestCartByUserId(userId: number, options: Partial<CartModelAdapterOptions> = {}): Promise<CartModel> {
        const [ rows ] = await this.db.execute(
            `SELECT
                cart.*
            FROM
                cart
            LEFT JOIN \`order\` ON \`order\`.cart_id = cart.cart_id
            WHERE
                cart.user_id = ?
                AND \`order\`.order_id IS NULL
            ORDER BY
                cart.created_at DESC
            LIMIT 1;`,
            [ userId, ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return await this.add(userId) as CartModel;
        }

        const cartId: number = +((rows as any[])[0]?.cart_id);

        return await this.getById(cartId, {
            loadUser: true,
            loadArticles: true,
        });
    }

    public async addArticleToLatestCartByUserId(userId: number, articleId: number, quantity: number): Promise<CartModel> {
        const cart = await this.getLatestCartByUserId(userId, {
            loadArticles: true,
        });

        const filteredArticles = cart.articles.filter(a => a.articleId === articleId);

        if (filteredArticles.length === 1) {
            await this.db.execute(
                `UPDATE
                    cart_article
                SET
                    quantity = quantity + ?
                WHERE
                    cart_id = ?
                    AND article_id = ?;`,
                [ quantity, cart.cartId, articleId, ]
            );
        } else {
            await this.db.execute(
                `INSERT
                    cart_article
                SET
                    quantity = ?,
                    cart_id = ?,
                    article_id = ?;`,
                [ quantity, cart.cartId, articleId, ]
            );
        }

        return await this.getById(cart.cartId, {
            loadArticles: true,
        });
    }

    public async setArticleToLatestCartByUserId(userId: number, articleId: number, quantity: number): Promise<CartModel> {
        const cart = await this.getLatestCartByUserId(userId, {
            loadArticles: true,
        });

        const filteredArticles = cart.articles.filter(a => a.articleId === articleId);

        if (filteredArticles.length === 1) {
            if (quantity > 0) {
                await this.db.execute(
                    `UPDATE
                        cart_article
                    SET
                        quantity = ?
                    WHERE
                        cart_id = ?
                        AND article_id = ?;`,
                    [ quantity, cart.cartId, articleId, ]
                );
            } else {
                await this.db.execute(
                    `DELETE FROM
                        cart_article
                    WHERE
                        cart_id = ?
                        AND article_id = ?;`,
                    [ cart.cartId, articleId, ]
                );
            }
        } else {
            if (quantity > 0) {
                await this.db.execute(
                    `INSERT
                        cart_article
                    SET
                        quantity = ?,
                        cart_id = ?,
                        article_id = ?;`,
                    [ quantity, cart.cartId, articleId, ]
                );
            }
        }

        return await this.getById(cart.cartId, {
            loadArticles: true,
        });
    }

    public async makeOrder(userId: number): Promise<CartModel|IErrorResponse> {
        return new Promise<CartModel|IErrorResponse>(async resolve => {
            const cart = await this.getLatestCartByUserId(userId, {
                loadArticles: true,
            });

            if (cart.articles.length === 0) {
                return resolve({
                    errorCode: -3011,
                    errorMessage: "You cannot make an order with an empty cart.",
                });
            }

            this.db.execute(
                `INSERT INTO \`order\` SET cart_id = ?;`,
                [ cart.cartId, ],
            )
            .then(async () => {
                resolve(await this.getById(cart.cartId, {
                    loadArticles: true,
                    loadOrder: true,
                    loadUser: true,
                }));
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage,
                });
            })
        });
    }

    public async getAllOrdersByUserId(userId: number): Promise<CartModel[]> {
        const [ rows ] = await this.db.execute(
            `SELECT
                cart.*
            FROM
                cart
            INNER JOIN \`order\` ON \`order\`.cart_id = cart.cart_id
            WHERE
                cart.user_id = ?
            ORDER BY
                \`order\`.created_at DESC;`,
            [ userId ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        const items: CartModel[] = [];

        for (const row of rows) {
            const data: any = row;

            items.push(await this.adaptModel(data, {
                loadArticles: true,
                loadOrder: true,
                loadUser: true,
            }));
        }

        return items;
    }

    public async getAllOrders(): Promise<CartModel[]> {
        const [ rows ] = await this.db.execute(
            `SELECT
                cart.*
            FROM
                cart
            INNER JOIN \`order\` ON \`order\`.cart_id = cart.cart_id
            ORDER BY
                \`order\`.created_at DESC;`
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        const items: CartModel[] = [];

        for (const row of rows) {
            const data: any = row;

            items.push(await this.adaptModel(data, {
                loadArticles: true,
                loadOrder: true,
                loadUser: true,
                articleModelAdapterOptions: {
                    loadCategory: true,
                    loadFeatures: true,
                    loadPhotos: true,
                    loadPrices: true,
                }
            }));
        }

        return items;
    }

    public async setOrderStatus(cartId: number, data: IOrderStatus): Promise<CartModel|IErrorResponse> {
        return new Promise<CartModel|IErrorResponse>(async resolve => {
            const cart = await this.getById(cartId, {
                loadOrder: true,
            });
    
            if (cart.order === null) {
                return resolve({
                    errorCode: -3022,
                    errorMessage: "This cart has no order.",
                });
            }

            this.db.execute(
                `UPDATE \`order\` SET \`status\` = ? WHERE order_id = ?;`,
                [ data.status, cart.order.orderId ]
            )
            .then(async () => {
                resolve(await this.getById(cartId, {
                    loadOrder: true,
                    loadArticles: true,
                    loadUser: true,
                }));
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    errorMessage: err?.sqlMessage,
                });
            });
        });
    }
}
