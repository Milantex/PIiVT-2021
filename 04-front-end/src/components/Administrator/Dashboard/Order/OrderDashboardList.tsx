import { Button, Form, InputGroup } from 'react-bootstrap';
import CartModel, { OrderStatus } from '../../../../../../03-back-end/src/components/cart/model';
import EventRegister from '../../../../api/EventRegister';
import ArticleService from '../../../../services/ArticleService';
import CartService from '../../../../services/CartService';
import BasePage from '../../../BasePage/BasePage';
import CartPreview from './CartPreview';

interface OrderDashboardListState {
    carts: CartModel[];
    cartStatusSaveButtonEnabled: Map<number, boolean>;
    displayedCart: CartModel | null;
}

export default class OrderDashboardList extends BasePage<{}> {
    state: OrderDashboardListState;

    constructor(props: any) {
        super(props);

        this.state = {
            carts: [],
            cartStatusSaveButtonEnabled: new Map(),
            displayedCart: null,
        };
    }

    private getOrders() {
        CartService.getAllOrders()
        .then(res => {
            const cartStatusSaveButtonEnabled: Map<number, boolean> = new Map();

            for (const cart of res) {
                cartStatusSaveButtonEnabled.set(cart.cartId, false);
            }

            this.setState({
                carts: res,
                cartStatusSaveButtonEnabled: cartStatusSaveButtonEnabled,
            });
        });
    }

    componentDidMount() {
        this.getOrders();

        EventRegister.on("ORDER_EVENT", this.getOrders.bind(this));
    }

    componentWillUnmount() {
        EventRegister.off("ORDER_EVENT", this.getOrders.bind(this));
    }

    private getLocalDate(isoDate: string): string {
        const date = new Date(isoDate);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    private getChangeOrderStatusHandler(cartId: number): (event: React.ChangeEvent<HTMLSelectElement>) => void {
        return (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newStatus = event.target?.value + "";

            this.setState((state: OrderDashboardListState) => {
                state.cartStatusSaveButtonEnabled.set(cartId, true);

                for (let cart of state.carts) {
                    if (cart.cartId === cartId && cart.order) {
                        cart.order.status = newStatus as OrderStatus;
                        break;
                    }
                }

                return state;
            });
        }
    }

    private setNewOrderStatus(cartId: number) {
        const status = this.state.carts.find(c => c.cartId === cartId)?.order?.status as OrderStatus;
        CartService.setOrderStatus(cartId, status);
    }

    renderMain(): JSX.Element {
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
                                          .map(ca => ca.quantity * ArticleService.getPriceBefore(ca.article, cart.order?.createdAt + ""))
                                          .reduce((sum, v) => sum + v, 0)
                                          .toFixed(2) }</td>
                                <td>{ cart.user.email }</td>
                                <td>
                                    <InputGroup>
                                        <Form.Control
                                            as="select"
                                            value={ cart.order?.status }
                                            onChange={ this.getChangeOrderStatusHandler(cart.cartId) }>
                                            <option value="pending">Pending</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="completed">Completed</option>
                                        </Form.Control>
                                        <InputGroup.Append>
                                            <Button
                                                disabled={ !this.state.cartStatusSaveButtonEnabled.get(cart.cartId) }
                                                variant="primary"
                                                onClick={ () => this.setNewOrderStatus(cart.cartId) }>
                                                Set status
                                            </Button>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={ () => this.setState({ displayedCart: cart }) }>
                                        Show cart
                                    </Button>
                                </td>
                            </tr>
                        )) }
                    </tbody>
                </table>

                {
                    this.state.displayedCart !== null
                    ? ( <CartPreview
                            cart={ this.state.displayedCart }
                            onClose={ () => this.setState({ displayedCart: null }) }
                        /> )
                    : ""
                }
            </>
        );
    }
}
