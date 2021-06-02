import BasePage from '../BasePage/BasePage';
import CartModel from '../../../../03-back-end/src/components/cart/model';
import { Card } from 'react-bootstrap';
import EventRegister from '../../api/EventRegister';
import CartService from '../../services/CartService';
import * as path from "path";
import { AppConfiguration } from '../../config/app.config';
import "./CartPage.sass";

interface CartPageState {
    cart: CartModel|null;
}

export default class CartPage extends BasePage<{}> {
    state: CartPageState;

    constructor(props: any) {
        super(props);
        
        this.state = {
            cart: null,
        };
    }

    private getCartData() {
        CartService.getCart()
        .then(res => {
            this.setState({
                cart: res
            });
        })
    }

    componentDidMount() {
        this.getCartData();
        EventRegister.on("CART_EVENT", this.getCartData.bind(this));
    }

    componentWillUnmount() {
        EventRegister.off("CART_EVENT", this.getCartData.bind(this));
    }

    getThumbPath(url: string): string {
        const directory = path.dirname(url);
        const extension = path.extname(url);
        const filename  = path.basename(url, extension);
        return directory + "/" + filename + "-thumb" + extension;
    }

    renderMain(): JSX.Element {
        if (this.state.cart === null) {
            return (
                <Card>
                    <Card.Header>
                        <Card.Title>
                            <h1>Your shopping cart</h1>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <p>Your shopping cart is empty.</p>
                    </Card.Body>
                </Card>
            );
        }

        return (
            <Card>
                <Card.Header>
                    <Card.Title>
                        <h1>Your shopping cart</h1>
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <table className="table table-sm cart-table">
                        <thead>
                            <tr>
                                <th colSpan={2}>Article</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Sum</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.state.cart.articles.map(ca => (
                                <tr key={ "cart-article-" + ca.cartArticleId }>
                                    <td>
                                        <img alt={ ca.article.title }
                                             src={ this.getThumbPath(AppConfiguration.API_URL + "/" + ca.article.photos[0].imagePath ) }
                                             className="article-image" />
                                    </td>
                                    <td>
                                        <b className="h5">{ ca.article.title }</b><br />
                                        <small>({ ca.article.category?.name })</small>
                                    </td>
                                    <td>
                                        &euro; { Number(ca.article.currentPrice).toFixed(2) }
                                    </td>
                                    <td>
                                        { ca.quantity }
                                    </td>
                                    <td>
                                        &euro; { Number(ca.article.currentPrice * ca.quantity).toFixed(2) }
                                    </td>
                                    <td>
                                        ...
                                    </td>
                                </tr>
                            )) }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4}></td>
                                <td>
                                    &euro; {
                                        this.state
                                            .cart
                                            .articles
                                            .map(ca => ca.article.currentPrice * ca.quantity)
                                            .reduce((sum, value) => sum + value, 0)
                                            .toFixed(2)
                                    }
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </Card.Body>
            </Card>
        );
    }
}
