import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { showToast } = useToast();

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    if (!email) {
      showToast("Inserisci un'email valida", 'warning');
      return;
    }
    showToast('Iscrizione completata ✅', 'success');
    form.reset();
  }

  return (
    <footer className="site-footer pt-5 mt-5">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="footer-logo">✨</div>
              <h5 className="m-0">Manuzon</h5>
            </div>
            <p className="text-secondary small mb-3">
              Tutto quello che cerchi a portata di click!
            </p>

            {/* Pulsanti social */}
            <div className="d-flex gap-2">
              <a href="#" className="social-pill" aria-label="Instagram">IG</a>
              <a href="#" className="social-pill" aria-label="LinkedIn">in</a>
              <a href="#" className="social-pill" aria-label="GitHub">GH</a>
            </div>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase small text-secondary mb-2">Navigazione</h6>
            <ul className="list-unstyled m-0">
              <li><Link className="footer-link" to="/">Home</Link></li>
              <li><Link className="footer-link" to="/cart">Carrello</Link></li>
              <li><Link className="footer-link" to="/checkout">Checkout</Link></li>
            </ul>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase small text-secondary mb-2">Supporto</h6>
            <ul className="list-unstyled m-0">
              <li><a className="footer-link" href="#">FAQ</a></li>
              <li><a className="footer-link" href="#">Resi</a></li>
              <li><a className="footer-link" href="#">Spedizioni</a></li>
              <li><a className="footer-link" href="#">Contatti</a></li>
            </ul>
          </Col>

          <Col md={4}>
            <h6 className="text-uppercase small text-secondary mb-2">Newsletter</h6>
            <Form onSubmit={handleSubscribe} className="d-flex gap-2">
              <Form.Control
                type="email"
                name="email"
                placeholder="La tua email"
                required
                aria-label="Email per iscrizione newsletter"
              />
              <button className="btn btn-primary" type="submit">Iscriviti</button>
            </Form>
            <div className="small text-secondary mt-2">
              Iscrivendoti accetti la nostra <a className="footer-link" href="#">Privacy Policy</a>.
            </div>
          </Col>
        </Row>

        <hr className="my-4 border-secondary-subtle" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pb-4 gap-2">
          <div className="small text-secondary">
            © {new Date().getFullYear()} Manuzon. Tutti i diritti riservati.
          </div>
          <div className="d-flex gap-3 small">
            <a className="footer-link" href="#">Privacy</a>
            <a className="footer-link" href="#">Termini</a>
            <a className="footer-link" href="#">Cookie</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
