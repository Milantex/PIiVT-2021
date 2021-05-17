import BaseController from '../../common/BaseController';
import { Request, Response } from 'express';
import { IAddArticle, IAddArticleValidator, IUploadedPhoto } from './dto/IAddArticle';
import Config from '../../config/dev';
import { v4 } from "uuid";

class ArticleController extends BaseController {
    public async getById(req: Request, res: Response) {
        const id: number = +(req.params?.id);

        if (id <= 0) {
            res.sendStatus(400);
            return;
        }

        const item = await this.services.articleService.getById(
            id,
            {
                loadCategory: true,
                loadPrices: true,
                loadFeatures: true,
                loadPhotos: true,
            }
        );

        if (item === null) {
            res.sendStatus(404);
            return;
        }

        res.send(item);
    }

    public async add(req: Request, res: Response) {
        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).send("You must upload at lease one and a maximum of " + Config.fileUpload.maxFiles + " photos.");
            return;
        }

        const fileKeys: string[] = Object.keys(req.files);

        const uploadedPhotos: IUploadedPhoto[] = [];

        for (const fileKey of fileKeys) {
            const file = req.files[fileKey] as any;

            const randomString = v4();
            const originalName = file?.name;
            const now = new Date();

            const imagePath = Config.fileUpload.uploadDestinationDirectory +
                              (Config.fileUpload.uploadDestinationDirectory.endsWith("/") ? "" : "/") +
                              now.getFullYear() + "/" +
                              ((now.getMonth() + 1) + "").padStart(2, "0") + "/" +
                              randomString + "-" + originalName;

            await file.mv(imagePath);

            uploadedPhotos.push({
                imagePath: imagePath,
            });
        }

        const data = JSON.parse(req.body?.data);

        if (!IAddArticleValidator(data)) {
            res.status(400).send(IAddArticleValidator.errors);
            return;
        }

        const result = await this.services.articleService.add(data as IAddArticle, uploadedPhotos);

        res.send(result);
    }
}

export default ArticleController;
