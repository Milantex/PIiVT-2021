import BaseService from '../../common/BaseService';
import IModelAdapterOptionsInterface from '../../common/IModelAdapterOptions.interface';
import ArticleModel, { ArticleFeatureValue, ArticlePhoto, ArticlePrice } from './model';
import { IAddArticle, IUploadedPhoto } from './dto/IAddArticle';
import CategoryModel from '../category/model';
import IErrorResponse from '../../common/IErrorResponse.interface';

class ArticleModelAdapterOptions implements IModelAdapterOptionsInterface {
    loadCategory: boolean = false;
    loadPrices: boolean = false;
    loadFeatures: boolean = false;
    loadPhotos: boolean = false;
}

class ArticleService extends BaseService<ArticleModel> {
    protected async adaptModel(
        data: any,
        options: Partial<ArticleModelAdapterOptions>
    ): Promise<ArticleModel> {
        const item: ArticleModel = new ArticleModel();

        item.articleId       = +(data?.article_id);
        item.title           = data?.title;
        item.excerpt         = data?.excerpt;
        item.description     = data?.description;
        item.isActive        = +(data?.is_active) === 1;
        item.isPromoted      = +(data?.is_promoted) === 1;
        item.createdAt       = new Date(data?.created_at);
        item.categoryId      = +(data?.category_id);

        item.currentPrice    = await this.getLatestPriceByArticleId(item.articleId);

        if (options.loadCategory) {
            item.category = await this.services.categoryService.getById(item.categoryId) as CategoryModel;
        }

        if (options.loadFeatures) {
            item.features = await this.getAllFeatureValuesByArticleId(item.articleId);
        }

        if (options.loadPrices) {
            item.prices = await this.getAllPricesByArticleId(item.articleId);
        }

        if (options.loadPhotos) {
            item.photos = await this.getAllPhotosByArticleId(item.articleId);
        }

        return item;
    }

    private async getAllFeatureValuesByArticleId(articleId: number): Promise<ArticleFeatureValue[]> {
        const sql = `
            SELECT
                article_feature.feature_id,
                article_feature.value,
                feature.name
            FROM
                article_feature
            INNER JOIN feature ON feature.feature_id = article_feature.feature_id
            WHERE
                article_feature.article_id = ?;`;
        const [ rows ] = await this.db.execute(sql, [ articleId ]);

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        const items: ArticleFeatureValue[] = [];

        for (const row of rows as any) {
            items.push({
                featureId: +(row?.feature_id),
                name: row?.name,
                value: row?.value,
            });
        }

        return items;
    }

    private async getAllPricesByArticleId(articleId: number): Promise<ArticlePrice[]> {
        const sql = `
            SELECT
                article_price_id,
                created_at,
                price
            FROM
                article_price
            WHERE
                article_id = ?
            ORDER BY
                created_at ASC;`;
        const [ rows ] = await this.db.execute(sql, [ articleId ]);

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        return rows.map(row => {
            return {
                priceId: +(row?.article_price_id),
                createdAt: new Date(row?.created_at),
                price: +(row?.price),
            }
        });

        /*
        const items: ArticlePrice[] = [];

        for (const row of rows as any) {
            items.push({
                priceId: +(row?.article_price_id),
                createdAt: new Date(row?.created_at),
                price: +(row?.price),
            });
        }

        return items;
        */
    }

    private async getAllPhotosByArticleId(articleId: number): Promise<ArticlePhoto[]> {
        const sql = `SELECT photo_id, image_path FROM photo WHERE article_id = ?;`;
        const [ rows ] = await this.db.execute(sql, [ articleId ]);

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        return rows.map(row => {
            return {
                photoId: +(row?.photo_id),
                imagePath: row?.image_path,
            }
        });
    }

    private async getLatestPriceByArticleId(articleId: number): Promise<number> {
        const sql = `SELECT price FROM article_price WHERE article_id = ? ORDER BY created_at DESC LIMIT 1;`;
        const [ rows ] = await this.db.execute(sql, [ articleId ]);

        if (!Array.isArray(rows) || rows.length === 0) {
            return 0;
        }

        const data: any = rows[0];

        return +(data?.price);
    }

    public async getById(
        articleId: number,
        options: Partial<ArticleModelAdapterOptions> = {},
    ): Promise<ArticleModel|IErrorResponse|null> {
        return this.getByIdFromTable(
            "article",
            articleId,
            options,
        );
    }

    public async add(
        data: IAddArticle,
        uploadedPhotos: IUploadedPhoto[],
    ): Promise<ArticleModel|IErrorResponse> {
        return new Promise<ArticleModel|IErrorResponse>(resolve => {
            this.db.beginTransaction()
            .then(() => {
                this.db.execute(
                    `
                    INSERT article
                    SET
                        title       = ?,
                        excerpt     = ?,
                        description = ?,
                        is_active   = ?,
                        is_promoted = ?,
                        category_id = ?;
                    `,
                    [
                        data.title,
                        data.excerpt,
                        data.description,
                        data.isActive ? 1 : 0,
                        data.isPromoted ? 1 : 0,
                        data.categoryId,
                    ]
                )
                .then(async (res: any) => {
                    const newArticleId: number = +(res[0]?.insertId);

                    const promises = [];

                    promises.push(
                        this.db.execute(
                            `INSERT article_price SET price = ?, article_id = ?;`,
                            [ data.price, newArticleId, ]
                        ),
                    );

                    for (const featureValue of data.features) {
                        promises.push(
                            this.db.execute(
                                `INSERT article_feature
                                 SET article_id = ?, feature_id = ?, value = ?;`,
                                [ newArticleId, featureValue.featureId, featureValue.value, ]
                            ),
                        );
                    }

                    for (const uploadedPhoto of uploadedPhotos) {
                        promises.push(
                            this.db.execute(
                                `INSERT photo SET article_id = ?, image_path = ?;`,
                                [ newArticleId, uploadedPhoto.imagePath, ]
                            ),
                        );
                    }

                    Promise.all(promises)
                    .then(async () => {
                        await this.db.commit();

                        resolve(await this.services.articleService.getById(
                            newArticleId,
                            {
                                loadCategory: true,
                                loadFeatures: true,
                                loadPhotos: true,
                                // loadPrices: true,
                            }
                        ));
                    })
                    .catch(async error => {
                        await this.db.rollback();
    
                        resolve({
                            errorCode: error?.errno,
                            errorMessage: error?.sqlMessage
                        });
                    });
                })
                .catch(async error => {
                    await this.db.rollback();

                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                })
            });
        });
    }
}

export default ArticleService;
