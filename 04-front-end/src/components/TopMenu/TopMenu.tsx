import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EventRegister from '../../api/EventRegister';

class TopMenuState {
    currentMenuType: "user" | "administrator" | "visitor" = "visitor";
}

export default class TopMenu extends React.Component {
    state: TopMenuState;

    constructor(props: any) {
        super(props);

        this.state = {
            currentMenuType: "visitor",
        }
    }

    componentDidMount() {
        EventRegister.on("AUTH_EVENT", this.authEventHandler.bind(this));
    }

    componentWillUnmount() {
        EventRegister.off("AUTH_EVENT", this.authEventHandler.bind(this));
    }

    private authEventHandler(message: string) {
        if (message === "force_login" || message === "user_logout" || message === "admninistrator_logout") {
            return this.setState({ currentMenuType: "visitor" });
        }

        if (message === "user_login") {
            return this.setState({ currentMenuType: "user" });
        }

        if (message === "admninistrator_login") {
            return this.setState({ currentMenuType: "admninistrator" });
        }
    }

    render() {
        if (this.state.currentMenuType === "visitor") {
            return (
                <Nav className="justify-content-center">
                    <Nav.Item>
                        <Link className="nav-link" to="/">Home</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/contact">Contact</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/user/login">User login</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/user/register">Register</Link>
                    </Nav.Item>
                </Nav>
            );
        }

        if (this.state.currentMenuType === "administrator") {
            return (
                <Nav className="justify-content-center">
                    <Nav.Item>
                        <Link className="nav-link" to="/">Home</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/category">Category management</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/article">Article management</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/user">User management</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/dashboard/order">Order management</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/administrator/logout">User login</Link>
                    </Nav.Item>
                </Nav>
            );
        }

        if (this.state.currentMenuType === "user") {
            return (
                <Nav className="justify-content-center">
                    <Nav.Item>
                        <Link className="nav-link" to="/">Home</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/category">Categories</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/contact">Contact</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/profile">My Account</Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Link className="nav-link" to="/user/logout">Logout</Link>
                    </Nav.Item>
                </Nav>
            );
        }
    }
}
