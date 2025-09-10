import React, { useState } from 'react';
import { Alert, Card, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const [validated, setValidated] = useState(false);
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <>
                <h1 className="h4 mb-3">Checkout</h1>
                <Alert variant="secondary">Il carrello è vuoto.</Alert>
                <Link to="/" className="btn btn-primary">Torna al catalogo</Link>
            </>
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        if (!form.checkValidity()) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        // simulazione ordine effettuato
        clearCart();
        navigate('/?order=success');
    }

    return (
        <>
            <h1 className="h4 mb-3">Checkout</h1>

            <Row className="g-4">
                <Col md={7}>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control required name="name" placeholder="Mario" />
                                    <Form.Control.Feedback type="invalid">Inserisci il nome.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Cognome</Form.Label>
                                    <Form.Control required name="surname" placeholder="Rossi" />
                                    <Form.Control.Feedback type="invalid">Inserisci il cognome.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control required type="email" name="email" placeholder="mario.rossi@example.com" />
                                    <Form.Control.Feedback type="invalid">Inserisci un'email valida.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Indirizzo</Form.Label>
                                    <Form.Control required name="address" placeholder="Via Roma 1" />
                                    <Form.Control.Feedback type="invalid">Inserisci l'indirizzo.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>CAP</Form.Label>
                                    <Form.Control required name="zip" pattern="\\d{5}" placeholder="00100" />
                                    <Form.Control.Feedback type="invalid">Inserisci un CAP valido (5 cifre).</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Note (opzionale)</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="notes" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex gap-2 mt-4">
                            <Link to="/cart" className="btn btn-outline-secondary">Torna al carrello</Link>
                            <button className="btn btn-primary" type="submit">Conferma ordine</button>
                        </div>
                    </Form>
                </Col>

                <Col md={5}>
                    <Card className="shadow-sm">
                        <Card.Header>Riepilogo ordine</Card.Header>
                        <Card.Body>
                            {items.map(({ product, qty }) => (
                                <div key={product.id} className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="small text-truncate me-2" title={product.title}>
                                        {product.title} × {qty}
                                    </div>
                                    <div className="small">€ {(qty * product.price).toFixed(2)}</div>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Totale</strong>
                                <strong>€ {total.toFixed(2)}</strong>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}
