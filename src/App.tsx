import React from 'react';
import { Container, Navbar, Nav, Badge, Dropdown } from 'react-bootstrap';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { User, LogOut, Shield, Settings, BarChart3 } from 'lucide-react';

import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import OrderSuccess from './pages/OrderSuccess';

import MiniCart from './components/MiniCart';
import Footer from './components/Footer';
import AdminPanel from './pages/AdminPanel';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    const { count } = useCart();
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const [showCart, setShowCart] = React.useState(false);
    const location = useLocation();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    const handleLogout = () => {
        logout();
        setShowCart(false);
    };

    return (
        <>
            {!isAuthPage && (
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

                                {/* Admin dropdown per admin */}
                                {isAuthenticated && isAdmin && (
                                    <Dropdown align="end">
                                        <Dropdown.Toggle
                                            variant="outline-warning"
                                            id="admin-dropdown"
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <Shield size={16} />
                                            <span className="d-none d-md-inline">Admin</span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Header>
                                                <div className="fw-semibold text-warning">
                                                    <Shield size={14} className="me-1" />
                                                    Area Admin
                                                </div>
                                            </Dropdown.Header>
                                            <Dropdown.Divider />
                                            <Dropdown.Item as={Link} to="/admin">
                                                <Settings size={16} className="me-2" />
                                                Pannello Admin
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/admin/dashboard">
                                                <BarChart3 size={16} className="me-2" />
                                                Dashboard & Statistiche
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}

                                {/* User menu */}
                                {isAuthenticated ? (
                                    <Dropdown align="end">
                                        <Dropdown.Toggle
                                            variant="outline-light"
                                            id="user-dropdown"
                                            className="d-flex align-items-center gap-2"
                                        >
                                            <User size={18} />
                                            <span className="d-none d-md-inline">
                                                {user?.firstName}
                                            </span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Header>
                                                <div className="fw-semibold">{user?.firstName} {user?.lastName}</div>
                                                <div className="small text-muted">{user?.email}</div>
                                            </Dropdown.Header>
                                            <Dropdown.Divider />
                                            <Dropdown.Item as={Link} to="/dashboard">
                                                <Settings size={16} className="me-2" />
                                                Dashboard
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={handleLogout}>
                                                <LogOut size={16} className="me-2" />
                                                Logout
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                ) : (
                                    <div className="d-flex align-items-center gap-2">
                                        <Link to="/login" className="btn btn-outline-light btn-sm">
                                            Accedi
                                        </Link>
                                        <Link to="/register" className="btn btn-primary btn-sm">
                                            Registrati
                                        </Link>
                                    </div>
                                )}

                                {/* Button carrello */}
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
            )}

            <main>
                {!isAuthPage && <Container className="py-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <UserDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute requireAdmin>
                                <AdminPanel />
                            </ProtectedRoute>
                        } />
                        {/* Nuove route aggiunte */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute requireAdmin>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                    </Routes>
                </Container>}

                {isAuthPage && (
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                )}
            </main>

            {!isAuthPage && <Footer />}

            {/* Mini-carrello */}
            <MiniCart show={showCart} onHide={() => setShowCart(false)} />
        </>
    );
}