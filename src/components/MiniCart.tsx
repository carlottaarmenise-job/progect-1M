import React from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

type Props = { show: boolean; onHide: () => void };

export default function MiniCart({ show, onHide }: Props) {
    const { items, total, setQty, removeFromCart } = useCart();
    const count = items.reduce((s, i) => s + i.qty, 0);

    return (
        <Offcanvas placement="end" show={show} onHide={onHide} scroll backdrop>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Carrello ({count})</Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
                {items.length === 0 ? (
                    <div className="text-center text-secondary">
                        Il carrello è vuoto.
                        <div className="mt-3">
                            <Link to="/" className="btn btn-primary" onClick={onHide}>
                                Vai al catalogo
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="vstack gap-3">
                            {items.map(({ product, qty }) => (
                                <div key={product.id} className="d-flex gap-3 align-items-center border rounded p-2">
                                    <div
                                        style={{ width: 64, height: 64 }}
                                        className="bg-light rounded d-flex align-items-center justify-content-center"
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    </div>

                                    <div className="flex-grow-1">
                                        <div className="small fw-semibold text-truncate" title={product.title}>
                                            {product.title}
                                        </div>
                                        <div className="small text-secondary">€ {product.price.toFixed(2)}</div>

                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setQty(product.id, Math.max(0, qty - 1))}
                                            >
                                                −
                                            </button>
                                            <Form.Control
                                                style={{ width: 70 }}
                                                size="sm"
                                                type="number"
                                                min={0}
                                                value={qty}
                                                onChange={(e) => {
                                                    const n = parseInt(e.target.value || '0', 10);
                                                    setQty(product.id, Number.isNaN(n) ? 0 : n);
                                                }}
                                            />
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setQty(product.id, qty + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <div className="small fw-semibold">€ {(qty * product.price).toFixed(2)}</div>
                                        <button
                                            className="btn btn-sm btn-outline-danger mt-2"
                                            onClick={() => removeFromCart(product.id)}
                                        >
                                            Rimuovi
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                            <strong>Totale</strong>
                            <strong>€ {total.toFixed(2)}</strong>
                        </div>

                        <div className="d-grid gap-2 mt-3">
                            <Link to="/cart" className="btn btn-outline-secondary" onClick={onHide}>
                                Vai al carrello
                            </Link>
                            <Link to="/checkout" className="btn btn-primary" onClick={onHide}>
                                Vai al checkout
                            </Link>
                        </div>
                    </>
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
}