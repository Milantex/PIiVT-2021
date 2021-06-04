import React from "react";
import { Button, Modal } from "react-bootstrap";
import CartModel from "../../../../../../03-back-end/src/components/cart/model";
import { AppConfiguration } from "../../../../config/app.config";
import ArticleService from "../../../../services/ArticleService";

interface CartPreviewProperties {
    cart: CartModel;
    onClose: () => any;
}

export default class CartPreview extends React.Component<CartPreviewProperties> {
    render() {
        return (
            <Modal show size="lg" centered onHide={ this.props.onClose }>
                <Modal.Header>
                    <Modal.Title>Shopping cart listing</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <table className="table table-sm cart-table">
                        <thead>
                            <tr>
                                <th colSpan={2}>Article</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Sum</th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.props.cart.articles.map(ca => (
                                <tr key={ "cart-article-" + ca.cartArticleId }>
                                    <td>
                                        <img alt={ ca.article.title }
                                            src={ ArticleService.getThumbPath(AppConfiguration.API_URL + "/" + ca.article.photos[0].imagePath ) }
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
                                </tr>
                            )) }
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={4}></td>
                                <td>
                                    &euro; {
                                        this.props
                                            .cart
                                            .articles
                                            .map(ca => ca.quantity * ArticleService.getPriceBefore(ca.article, this.props.cart.order?.createdAt + ""))
                                            .reduce((sum, value) => sum + value, 0)
                                            .toFixed(2)
                                    }
                                </td>
                            </tr>
                            <tr>
                                <th>Order ID:</th>
                                <td colSpan={4}>#{ this.props.cart.order?.orderId }</td>
                            </tr>
                            <tr>
                                <th>Order date:</th>
                                <td colSpan={4}>{ this.props.cart.order?.createdAt }</td>
                            </tr>
                            <tr>
                                <th>Status:</th>
                                <td colSpan={4}>{ this.props.cart.order?.status }</td>
                            </tr>
                            <tr>
                                <th>Forename:</th>
                                <td colSpan={4}>{ this.props.cart.user.forename }</td>
                            </tr>
                            <tr>
                                <th>Surname:</th>
                                <td colSpan={4}>{ this.props.cart.user.surname }</td>
                            </tr>
                            <tr>
                                <th>E-mail:</th>
                                <td colSpan={4}>{ this.props.cart.user.email }</td>
                            </tr>
                            <tr>
                                <th>Address:</th>
                                <td colSpan={4}>{ this.props.cart.user.postalAddress }</td>
                            </tr>
                        </tfoot>
                    </table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={ this.props.onClose }>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
