import BaseService from '../../common/BaseService';
import IModelAdapterOptionsInterface from '../../common/IModelAdapterOptions.interface';
import ArticleModel, { ArticleFeatureValue, ArticlePhoto, ArticlePrice } from './model';
import { IAddArticle, IUploadedPhoto } from './dto/IAddArticle';
import CategoryModel from '../category/model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditArticle } from './dto/IEditArticle';
import * as fs from "fs";
import Config from '../../config/dev';
import * as path from 'path';

export class ArticleModelAdapterOptions implements IModelAdapterOptionsInterface {
    loadCategory: boolean = false;
    loadPrices: boolean = true;
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

    private editArticle(articleId: number, data: IEditArticle) {
        return this.db.execute(
            `UPDATE
                article
            SET
                title = ?,
                excerpt = ?,
                description = ?,
                is_active = ?,
                is_promoted = ?
            WHERE
                article_id = ?;`,
            [
                data.title,
                data.excerpt,
                data.description,
                data.isActive ? 1 : 0,
                data.isPromoted ? 1 : 0,
                articleId,
            ]
        );
    }

    private addArticlePrice(articleId: number, newPrice: number) {
        return this.db.execute(
            `INSERT
                article_price
            SET
                article_id = ?,
                price = ?;`,
            [ articleId, newPrice, ],
        );
    }

    private deleteArticleFeature(articleId: number, featureId: number) {
        return this.db.execute(
            `DELETE FROM
                article_feature
            WHERE
                article_id = ? AND
                feature_id = ?;`,
            [
                articleId,
                featureId,
            ]
        );
    }

    private insertOrUpdateFeatureValue(articleId: number, fv: ArticleFeatureValue) {
        return this.db.execute(
            `INSERT
                article_feature
            SET
                article_id = ?,
                feature_id = ?,
                value      = ?
            ON DUPLICATE KEY
            UPDATE
                value      = ?;`,
            [
                articleId,
                fv.featureId,
                fv.value,
                fv.value,
            ],
        );
    }

    public async edit(articleId: number, data: IEditArticle): Promise<ArticleModel|null|IErrorResponse> {
        return new Promise<ArticleModel|null|IErrorResponse>(async resolve => {
            const currentArticle = await this.getById(articleId, {
                loadFeatures: true,
            });

            if (currentArticle === null) {
                return resolve(null);
            }

            const rollbackAndResolve = async (error) => {
                await this.db.rollback();
                resolve({
                    errorCode: error?.errno,
                    errorMessage: error?.sqlMessage
                });
            }

            this.db.beginTransaction()
                .then(() => {
                    this.editArticle(articleId, data)
                    .catch(error => {
                        rollbackAndResolve({
                            errno: error?.errno,
                            sqlMessage: "Part article: " + error?.sqlMessage,
                        });
                    });
                })
                .then(async () => {
                    const currentPrice = (currentArticle as ArticleModel).currentPrice.toFixed(2);
                    const newPrice     = data.price.toFixed(2);

                    if (currentPrice !== newPrice) {
                        this.addArticlePrice(articleId, data.price)
                        .catch(error => {
                            rollbackAndResolve({
                                errno: error?.errno,
                                sqlMessage: "Part price: " + error?.sqlMessage,
                            });
                        })
                    }
                })
                .then(async () => {
                    const willHaveFeatures = data.features.map(fv => fv.featureId);
                    const currentFeatures  = (currentArticle as ArticleModel).features.map(f => f.featureId);

                    for (const currentFeature of currentFeatures) {
                        if (!willHaveFeatures.includes(currentFeature)) {
                            this.deleteArticleFeature(articleId, currentFeature)
                            .catch(error => {
                                rollbackAndResolve({
                                    errno: error?.errno,
                                    sqlMessage: `Part delete feature ID(${currentFeature}): ${error?.sqlMessage}`,
                                });
                            });
                        }
                    }
                })
                .then(async () => {
                    for (const fv of data.features) {
                        this.insertOrUpdateFeatureValue(articleId, fv)
                        .catch(error => {
                            rollbackAndResolve({
                                errno: error?.errno,
                                sqlMessage: `Part add/edit feature ID(${fv.featureId}): ${error?.sqlMessage}`,
                            });
                        });
                    }
                })
                .then(async () => {
                    this.db.commit()
                    .catch(error => {
                        rollbackAndResolve({
                            errno: error?.errno,
                            sqlMessage: `Part save changes: ${error?.sqlMessage}`,
                        });
                    });
                })
                .then(async () => {
                    resolve(await this.getById(articleId, {
                        loadCategory: true,
                        loadFeatures: true,
                        loadPhotos: true,
                        loadPrices: true,
                    }));
                })
                .catch(async error => {
                    await this.db.rollback();

                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                });
        });
    }

    public async delete(articleId: number): Promise<IErrorResponse|null> {
        return new Promise<IErrorResponse>(async resolve => {
            const currentArticle = await this.getById(articleId, {
                loadFeatures: true,
                loadPhotos: true,
                loadPrices: true,
            });

            if (currentArticle === null) {
                return resolve(null);
            }

            this.db.beginTransaction()
                .then(async () => {
                    if (await this.deleteArticlePrices(articleId)) return;
                    throw { errno: -1002, sqlMessage: "Could not delete article prices.", };
                })
                .then(async () => {
                    if (await this.deleteArticleFeatureValues(articleId)) return;
                    throw { errno: -1003, sqlMessage: "Could not delete article feature values.", };
                })
                .then(async () => {
                    if (await this.deleteArticleCartRecord(articleId)) return;
                    throw { errno: -1004, sqlMessage: "Could not delete article cart records.", };
                })
                .then(async () => {
                    const filesToDelete = await this.deleteArticlePhotoRecords(articleId);
                    if (filesToDelete.length !== 0) return filesToDelete;
                    throw { errno: -1005, sqlMessage: "Could not delete article photo records.", };
                })
                .then(async (filesToDelete) => {
                    if (await this.deleteArticleRecord(articleId)) return filesToDelete;
                    throw { errno: -1006, sqlMessage: "Could not delete the article records.", };
                })
                .then(async (filesToDelete) => {
                    await this.db.commit();
                    return filesToDelete;
                })
                .then((filesToDelete) => {
                    this.deleteArticlePhotosAndResizedVersion(filesToDelete);
                })
                .then(() => {
                    resolve({
                        errorCode: 0,
                        errorMessage: "Article deleted!",
                    });
                })
                .catch(async error => {
                    await this.db.rollback();
                    resolve({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });
                });
        });
    }

    private async deleteArticlePrices(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM article_price WHERE article_id = ?;`,
                [ articleId ]
            )
            .then(() => resolve(true))
            .catch(() => resolve(false));
        });
    }

    private async deleteArticleFeatureValues(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM article_feature WHERE article_id = ?;`,
                [ articleId ]
            )
            .then(() => resolve(true))
            .catch(() => resolve(false));
        });
    }

    private async deleteArticleCartRecord(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM cart_article WHERE article_id = ?;`,
                [ articleId ]
            )
            .then(() => resolve(true))
            .catch(() => resolve(false));
        });
    }

    private async deleteArticlePhotoRecords(articleId: number): Promise<string[]> {
        return new Promise<string[]>(async resolve => {
            const [ rows ] = await this.db.execute(
                `SELECT image_path FROM photo WHERE article_id = ?;`,
                [ articleId ]
            );

            if (!Array.isArray(rows) || rows.length === 0) return resolve([]);

            const filesToDelete = rows.map(row => row?.image_path);

            this.db.execute(
                `DELETE FROM photo WHERE article_id = ?;`,
                [ articleId ]
            )
            .then(() => resolve(filesToDelete))
            .catch(() => resolve([]))

            resolve(filesToDelete);
        });
    }

    private async deleteArticleRecord(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM article WHERE article_id = ?;`,
                [ articleId ]
            )
            .then(() => resolve(true))
            .catch(() => resolve(false));
        });
    }

    private deleteArticlePhotosAndResizedVersion(filesToDelete: string[]) {
        try {
            for (const fileToDelete of filesToDelete) {
                fs.unlinkSync(fileToDelete);

                const pathParts = path.parse(fileToDelete);

                const directory = pathParts.dir;
                const filename  = pathParts.name;
                const extension = pathParts.ext;

                for (const resizeSpecification of Config.fileUpload.photos.resizes) {
                    const resizedImagePath = directory + "/" +
                                             filename +
                                             resizeSpecification.sufix +
                                             extension;

                    fs.unlinkSync(resizedImagePath);
                }
            }
        } catch (e) { }
    }

    public async deleteArticlePhoto(articleId: number, photoId: number): Promise<IErrorResponse|null> {
        return new Promise<IErrorResponse|null>(async resolve => {
            const article = await this.getById(articleId, {
                loadPhotos: true,
            });

            if (article === null) {
                return resolve(null);
            }

            const filteredPhotos = (article as ArticleModel).photos.filter(p => p.photoId === photoId);

            if (filteredPhotos.length === 0) {
                return resolve(null);
            }

            const photo = filteredPhotos[0];

            this.db.execute(
                `DELETE FROM photo WHERE photo_id = ?;`,
                [ photo.photoId ]
            )
            .then(() => {
                this.deleteArticlePhotosAndResizedVersion([
                    photo.imagePath
                ]);

                resolve({
                    errorCode: 0,
                    errorMessage: "Photo deleted.",
                });
            })
            .catch(error => resolve({
                errorCode: error?.errno,
                errorMessage: error?.sqlMessage
            }))
        });
    }

    public async addArticlePhotos(articleId: number, uploadedPhotos: IUploadedPhoto[]): Promise<ArticleModel|IErrorResponse|null> {
        return new Promise<ArticleModel|IErrorResponse|null>(async resolve => {
            const article = await this.getById(articleId, {
                loadPhotos: true,
            });

            if (article === null) {
                return resolve(null);
            }

            this.db.beginTransaction()
                .then(() => {
                    const promises = [];

                    for (const uploadedPhoto of uploadedPhotos) {
                        promises.push(
                            this.db.execute(
                                `INSERT photo SET article_id = ?, image_path = ?;`,
                                [ articleId, uploadedPhoto.imagePath, ]
                            ),
                        );
                    }

                    Promise.all(promises)
                        .then(async () => {
                            await this.db.commit();

                            resolve(await this.services.articleService.getById(
                                articleId,
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
        })
    }

    public async getAllByCategoryId(categoryId: number): Promise<ArticleModel[]> {
        return await this.getAllByFieldNameFromTable<ArticleModelAdapterOptions>("article", "category_id", categoryId, {
            loadPhotos: true,
        }) as ArticleModel[];
    }
}

export default ArticleService;
