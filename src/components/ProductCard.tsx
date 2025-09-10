import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
    const { addToCart } = useCart();
    const { showToast } = useToast();

    function handleAdd() {
        addToCart(product, 1);
        showToast('Aggiunto al carrello ✅', 'success');
    }

    return (
        <Card className="h-100 shadow-sm">
            <div className="ratio ratio-4x3 bg-light">
                <img
                    src={product.image}
                    alt={product.title}
                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
            </div>
            <Card.Body className="d-flex flex-column">
                <Card.Title className="fs-6 text-truncate" title={product.title}>
                    {product.title}
                </Card.Title>
                <div className="fw-bold mb-2">€ {product.price.toFixed(2)}</div>
                <div className="mt-auto d-flex gap-2">
                    <Link to={`/product/${product.id}`} className="btn btn-outline-secondary btn-sm">
                        Dettagli
                    </Link>
                    <Button size="sm" variant="primary" onClick={handleAdd}>
                        Aggiungi
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}
