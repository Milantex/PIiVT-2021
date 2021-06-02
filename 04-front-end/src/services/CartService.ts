import CartModel from '../../../03-back-end/src/components/cart/model';
import api from '../api/api';
import EventRegister from '../api/EventRegister';
import { MemoizeExpiring } from "typescript-memoize";

export default class CartService {
    @MemoizeExpiring(2000)
    public static getCart(): Promise<CartModel|null> {
        return new Promise<CartModel|null>(resolve => {
            api("get", "/cart", "user")
            .then(res => {
                if (res.status !== "ok") return resolve(null);
                resolve(res.data);
            })
        });
    }

    public static addToCart(articleId: number, quantity: number) {
        api("post", "/cart", "user", {
            articleId: articleId,
            quantity: quantity
        })
        .then(res => {
            if (res.status !== "ok") return;
            if (res.data.errorCode !== undefined) return;
            EventRegister.emit("CART_EVENT", "cart.add", articleId, quantity);
        });
    }

    public static setToCart(articleId: number, newQuantity: number) {
        api("put", "/cart", "user", {
            articleId: articleId,
            quantity: newQuantity
        })
        .then(res => {
            if (res.status !== "ok") return;
            if (res.data.errorCode !== undefined) return;
            EventRegister.emit("CART_EVENT", "cart.update", articleId, newQuantity);
        });
    }
}
