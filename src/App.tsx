import React from 'react';
import { Container, Navbar, Nav, Badge } from 'react-bootstrap';
import { Routes, Route, NavLink, Link } from 'react-router-dom';

import { useCart } from './context/CartContext';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

import MiniCart from './components/MiniCart';
import Footer from './components/Footer';
import AdminPanel from './pages/AdminPanel';

export default function App() {
    const { count } = useCart();
    const [showCart, setShowCart] = React.useState(false);

    return (
        <>
            <Navbar bg="dark" data-bs-theme="dark" expand="md">
                <Container>
                    <Link to="/" className="navbar-brand">Manuzon-shopp</Link>

                    <Navbar.Toggle />
                    <Navbar.Collapse>
                        <Nav className="ms-auto align-items-center gap-2">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                            >
                                Home
                            </NavLink>

                            <NavLink
                                to="/cart"
                                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                            >
                                Carrello
                            </NavLink>

                            <NavLink
                                to="/checkout"
                                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                            >
                                Checkout
                            </NavLink>

                            {/* Button per mini-carrello */}
                            <button
                                type="button"
                                className="btn btn-outline-light d-flex align-items-center gap-1"
                                onClick={() => setShowCart(true)}
                            >
                                🛒 <span>Carrello</span> <Badge bg="primary">{count}</Badge>
                            </button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main>
                <Container className="py-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/admin" element={<AdminPanel />} />
                    </Routes>
                </Container>
            </main>

            <Footer />

            {/* Mini-carrello */}
            <MiniCart show={showCart} onHide={() => setShowCart(false)} />
        </>
    );
}
