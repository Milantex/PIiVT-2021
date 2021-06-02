import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import CartService from '../../services/CartService';
import EventRegister from '../../api/EventRegister';
import "./CartLink.sass";

interface CartLinkState {
    count: number;
    message: string;
}

export default class CartLink extends React.Component {
    state: CartLinkState;

    constructor(props: any) {
        super(props);

        this.state = {
            count: 0,
            message: "",
        };
    }

    private getCartArticleCount(message: string = "") {
        CartService.getCart()
        .then(res => {
            if (res === null) return this.setState({ count: 0 });
            
            this.setState({
                count: res.articles.length,
                message: message,
            });

            if (message.length !== 0) {
                setTimeout(() => this.setState({ message: "" }), 3000);
            }
        })
    }

    private cartUpdateEventHandler() {
        this.getCartArticleCount("Cart updated!");
    }

    componentDidMount() {
        this.getCartArticleCount();
        EventRegister.on("CART_EVENT", this.cartUpdateEventHandler.bind(this));
    }

    componentWillUnmount() {
        EventRegister.off("CART_EVENT", this.cartUpdateEventHandler.bind(this));
    }

    render() {
        return (
            <Nav.Link as="div">
                <Link to="/cart" className="cart-link">
                    &#128722; Cart ({ this.state.count })
                    {
                        this.state.message.length > 0
                        ? (
                            <div className="cart-link-message">
                                { this.state.message }
                            </div>
                        )
                        : ""
                    }
                </Link>
            </Nav.Link>
        );
    }
}
