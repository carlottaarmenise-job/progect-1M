import React from 'react';
import { Alert, Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
    const { items, total, setQty, removeFromCart, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <>
                <h1 className="h4 mb-3">Carrello</h1>
                <Alert variant="secondary">Il tuo carrello è vuoto.</Alert>
                <Link to="/" className="btn btn-primary">Torna al catalogo</Link>
            </>
        );
    }

    return (
        <>
            <h1 className="h4 mb-3">Carrello</h1>

            <Table responsive bordered hover>
                <thead>
                    <tr>
                        <th style={{ width: 80 }}>Img</th>
                        <th>Prodotto</th>
                        <th style={{ width: 120 }}>Prezzo</th>
                        <th style={{ width: 120 }}>Quantità</th>
                        <th style={{ width: 120 }}>Subtotale</th>
                        <th style={{ width: 80 }}>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(({ product, qty }) => (
                        <tr key={product.id}>
                            <td>
                                <div className="ratio ratio-1x1 bg-light">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                    />
                                </div>
                            </td>
                            <td>
                                <div className="fw-semibold small">{product.title}</div>
                                <div className="text-secondary small">{product.category}</div>
                            </td>
                            <td>€ {product.price.toFixed(2)}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    value={qty}
                                    onChange={(e) => {
                                        const n = parseInt(e.target.value || '0', 10);
                                        setQty(product.id, Number.isNaN(n) ? 0 : n);
                                    }}
                                />
                            </td>
                            <td>€ {(qty * product.price).toFixed(2)}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeFromCart(product.id)}
                                >
                                    Rimuovi
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Row className="align-items-center g-3">
                <Col xs={12} md="auto">
                    <Link to="/" className="btn btn-outline-secondary">Continua lo shopping</Link>
                </Col>
                <Col xs={12} md="auto">
                    <button className="btn btn-outline-danger" onClick={clearCart}>Svuota carrello</button>
                </Col>
                <Col className="ms-md-auto text-md-end">
                    <div className="h5 mb-3">Totale: € {total.toFixed(2)}</div>
                    <Link to="/checkout" className="btn btn-primary">Vai al checkout</Link>
                </Col>
            </Row>
        </>
    );
}
