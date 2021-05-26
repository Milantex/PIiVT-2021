import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function TopMenu() {
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
        </Nav>
    );
}
