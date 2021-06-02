import BaseController from '../../common/BaseController';
import { Request, Response } from "express";
import IAddToCart, { IAddToCartValidator } from './dto/ICart';
import CartModel from './model';
import { IOrderStatus, IOrderStatusValidator } from './dto/IOrderStatus';

export default class CartController extends BaseController {
    private isCallerUser(req: Request, res: Response): boolean {
        if (req.authorized?.role !== "user") {
            res.status(403).send("This action is only available to the user role.");
            return false;
        }

        if (!req.authorized?.id) {
            res.status(403).send("Unknown user identifier.");
            return false;
        }

        return true;
    }

    public async getCurrentUserCart(req: Request, res: Response) {
        if (!this.isCallerUser(req, res)) return;
        res.send(await this.services.cartService.getLatestCartByUserId(req.authorized?.id));
    }

    public async addToCart(req: Request, res: Response) {
        if (!this.isCallerUser(req, res)) return;

        if (!IAddToCartValidator(req.body)) {
            return res.status(400).send(IAddToCartValidator.errors);
        }

        const data = req.body as IAddToCart;

        const article = await this.services.articleService.getById(data.articleId);

        if (article === null) {
            return res.status(404).send("Article not found.");
        }

        res.send(
            await this.services.cartService.addArticleToLatestCartByUserId(
                req.authorized?.id,
                data.articleId,
                data.quantity
            )
        );
    }

    public async setInCart(req: Request, res: Response) {
        if (!this.isCallerUser(req, res)) return;

        if (!IAddToCartValidator(req.body)) {
            return res.status(400).send(IAddToCartValidator.errors);
        }

        const data = req.body as IAddToCart;

        const article = await this.services.articleService.getById(data.articleId);

        if (article === null) {
            return res.status(404).send("Article not found.");
        }

        res.send(
            await this.services.cartService.setArticleToLatestCartByUserId(
                req.authorized?.id,
                data.articleId,
                data.quantity
            )
        );
    }

    public async makeOrder(req: Request, res: Response) {
        if (!this.isCallerUser(req, res)) return;

        const order = await this.services.cartService.makeOrder(req.authorized?.id);

        if (!(order instanceof CartModel)) {
            return res.status(400).send(order);
        }

        res.send(order);
    }

    public async getAllOrdersForCurrentUser(req: Request, res: Response) {
        if (!this.isCallerUser(req, res)) return;

        res.send(await this.services.cartService.getAllOrdersByUserId(req.authorized?.id));
    }

    public async getAllOrders(req: Request, res: Response) {
        res.send(await this.services.cartService.getAllOrders());
    }

    public async getAllOrdersByUserId(req: Request, res: Response) {
        const userId: number = +(req.params?.uid);

        if (userId < 0) {
            return res.status(400).send("Invalid user ID.");
        }

        res.send(await this.services.cartService.getAllOrdersByUserId(userId));
    }

    public async setStatus(req: Request, res: Response) {
        const cartId: number = +(req.params?.cid);

        if (cartId < 0) {
            return res.status(400).send("Invalid cart ID.");
        }

        if (!IOrderStatusValidator(req.body)) {
            return res.status(400).send(IOrderStatusValidator.errors);
        }

        const data = req.body as IOrderStatus;

        res.send(await this.services.cartService.setOrderStatus(cartId, data));
    }
}
