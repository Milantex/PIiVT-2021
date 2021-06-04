import CartModel, { OrderStatus } from '../../../03-back-end/src/components/cart/model';
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

    public static makeOrder() {
        api("post", "/cart/order", "user")
        .then(res => {
            if (res.status !== "ok") {
                EventRegister.emit("ORDER_EVENT", "order.failed", res.data);
            } else {
                EventRegister.emit("ORDER_EVENT", "order.success", res.data);
            }

            EventRegister.emit("CART_EVENT", "cart.update");
        });
    }

    public static getAllOrders(): Promise<CartModel[]> {
        return new Promise<CartModel[]>(resolve => {
            api("get", "/order", "administrator")
            .then(res => {
                if (res.status !== "ok") {
                    return resolve([]);
                }
                resolve(res.data);
            })
        });
    }

    public static setOrderStatus(cartId: number, status: OrderStatus) {
        api("put", "/cart/" + cartId, "administrator", { status: status })
        .then(res => {
            if (res.status !== "ok") return;
            if (res.data.errorCode !== undefined) return;
            EventRegister.emit("ORDER_EVENT", "order.updated", cartId);
        });
    }
}
