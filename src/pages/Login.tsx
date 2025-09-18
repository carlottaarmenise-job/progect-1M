import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');

  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // URL di redirect dopo il login
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setError('');
      await login({ email, password });
      showToast('Accesso effettuato con successo!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'accesso');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            {/* Back button */}
            <div className="mb-3">
              <Link to="/" className="btn btn-link text-decoration-none p-0">
                <ArrowLeft size={20} className="me-2" />
                Torna al negozio
              </Link>
            </div>

            <Card className="shadow border-0" style={{ backdropFilter: 'blur(10px)' }}>
              <Card.Header className="bg-transparent border-0 text-center py-4">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--brand, #6a4dff), var(--brand-2, #00d1ff))'
                    }}
                  >
                    <LogIn size={24} className="text-white" />
                  </div>
                  <h2 className="h4 mb-0">Accedi</h2>
                </div>
                <p className="text-muted small mb-0">Accedi al tuo account Manuzon</p>
              </Card.Header>

              <Card.Body className="px-4 pb-4">
                {error && (
                  <Alert variant="danger" className="small">
                    {error}
                  </Alert>
                )}

                {/* Demo credentials info */}
                <Alert variant="info" className="small">
                  <strong>Account demo:</strong><br />
                  Admin: admin@manuzon.com / admin123<br />
                  User: user@example.com / user123
                </Alert>

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="mario.rossi@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Inserisci un'email valida.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="La tua password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                        style={{ zIndex: 10 }}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        type="button"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      La password deve essere di almeno 6 caratteri.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="remember"
                      label="Ricordami"
                      className="small"
                    />
                    <Link to="/forgot-password" className="small text-decoration-none">
                      Password dimenticata?
                    </Link>
                  </div>

                  <div className="d-grid gap-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Accesso in corso...
                        </>
                      ) : (
                        'Accedi'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted small">Non hai un account? </span>
                  <Link to="/register" className="text-decoration-none">
                    Registrati
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}