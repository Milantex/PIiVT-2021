import { ArticlePrice } from '../../../../../../03-back-end/src/components/article/model';
import CartModel from '../../../../../../03-back-end/src/components/cart/model';
import CartService from '../../../../services/CartService';
import BasePage from '../../../BasePage/BasePage';

interface OrderDashboardListState {
    carts: CartModel[];
}

export default class OrderDashboardList extends BasePage<{}> {
    state: OrderDashboardListState;

    constructor(props: any) {
        super(props);

        this.state = {
            carts: [],
        };
    }

    private getOrders() {
        CartService.getAllOrders()
        .then(res => {
            this.setState({
                carts: res,
            });
        });
    }

    componentDidMount() {
        this.getOrders();
    }

    private getLocalDate(isoDate: string): string {
        const date = new Date(isoDate);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    private getPriceBefore(prices: ArticlePrice[], date: string, currentPrice: number = 0): number {
        if (prices === undefined) {
            return currentPrice;
        }

        if (prices.length === 0) {
            return currentPrice;
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

    renderMain(): JSX.Element {
        console.log(this.state.carts);
        return (
            <>
                <h1>All orders</h1>
                <table className="table table-sm">
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Date and Time</th>
                            <th>Total price</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.state.carts.map(cart => (
                            <tr key={ "order-cart-" + cart.cartId }>
                                <td>{ cart.order?.orderId }</td>
                                <td>{ this.getLocalDate(cart.order?.createdAt + "") }</td>
                                <td>&euro; { cart.articles
                                          .map(ca => ca.quantity * this.getPriceBefore(ca.article.prices, cart.order?.createdAt + "", ca.article.currentPrice))
                                          .reduce((sum, v) => sum + v, 0)
                                          .toFixed(2) }</td>
                                <td>{ cart.user.email }</td>
                                <td>{ cart.order?.status }</td>
                                <td>...</td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </>
        );
    }
}
