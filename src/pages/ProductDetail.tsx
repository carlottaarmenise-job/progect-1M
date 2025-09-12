import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Placeholder, Row, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getProductById } from '../data/api';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();
    const { showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const num = Number(id);
        getProductById(num)
            .then((p) => { if (!cancelled) setProduct(p); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    function add() {
        if (!product) return;
        const safe = Math.max(1, Math.min(99, qty));
        addToCart(product, safe);
        showToast(`Aggiunto al carrello (x${safe}) ✅`, 'success');
    }

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkAs="span">
                    <Link to="/" className="text-decoration-none">Home</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Prodotto</Breadcrumb.Item>
            </Breadcrumb>

            {loading || !product ? (
                <>
                    <Placeholder as="h1" animation="wave">
                        <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder animation="wave" className="d-block mb-3" xs={12} />
                    <div className="ratio ratio-4x3 bg-light rounded" />
                </>
            ) : (
                <Row className="g-4">
                    <Col md={6}>
                        <div className="ratio ratio-4x3 bg-light rounded p-3 d-flex align-items-center justify-content-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <h1 className="h4">{product.name}</h1>
                        <div className="mb-2 text-secondary">{product.category}</div>
                        <div className="h4 mb-3">€ {product.price.toFixed(2)}</div>
                        <p>{product.description}</p>

                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-outline-secondary" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <Form.Control
                                    style={{ width: 80 }}
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={qty}
                                    onChange={(e) => setQty(Math.max(1, Math.min(99, parseInt(e.target.value || '1', 10) || 1)))}
                                />
                                <button className="btn btn-outline-secondary" onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
                            </div>

                            <Button variant="primary" onClick={add}>
                                Aggiungi al carrello
                            </Button>

                            <Link to="/" className="btn btn-outline-secondary">
                                Torna al catalogo
                            </Link>
                        </div>
                    </Col>
                </Row>
            )}
        </>
    );
}
