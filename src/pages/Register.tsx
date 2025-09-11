import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePasswords = () => {
    return formData.password === formData.confirmPassword;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthColor = ['danger', 'danger', 'warning', 'info', 'success'][passwordStrength] || 'danger';
  const passwordStrengthText = ['Molto debole', 'Debole', 'Media', 'Forte', 'Molto forte'][passwordStrength] || 'Molto debole';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (!form.checkValidity() || !validatePasswords() || !acceptTerms) {
      e.stopPropagation();
      setValidated(true);
      if (!validatePasswords()) {
        setError('Le password non corrispondono');
      } else if (!acceptTerms) {
        setError('Devi accettare i termini e condizioni');
      }
      return;
    }

    try {
      setError('');
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      showToast('Registrazione completata con successo!', 'success');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
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
                    <UserPlus size={24} className="text-white" />
                  </div>
                  <h2 className="h4 mb-0">Registrati</h2>
                </div>
                <p className="text-muted small mb-0">Crea il tuo account Manuzon</p>
              </Card.Header>

              <Card.Body className="px-4 pb-4">
                {error && (
                  <Alert variant="danger" className="small">
                    {error}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Mario"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          Inserisci il tuo nome.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cognome</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Rossi"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          Inserisci il tuo cognome.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="mario.rossi@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      Inserisci un'email valida.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crea una password sicura"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
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
                    
                    {/* Password indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Sicurezza password:</small>
                          <small className={`text-${passwordStrengthColor}`}>
                            {passwordStrengthText}
                          </small>
                        </div>
                        <div className="progress" style={{ height: 4 }}>
                          <div 
                            className={`progress-bar bg-${passwordStrengthColor}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <Form.Control.Feedback type="invalid">
                      La password deve essere di almeno 6 caratteri.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Conferma Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Ripeti la password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required
                        disabled={loading}
                        className={validated && !validatePasswords() ? 'is-invalid' : ''}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                        style={{ zIndex: 10 }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        type="button"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                    {validated && !validatePasswords() && (
                      <div className="invalid-feedback d-block">
                        Le password non corrispondono.
                      </div>
                    )}
                    {formData.confirmPassword && validatePasswords() && (
                      <div className="text-success small mt-1">
                        <Check size={16} className="me-1" />
                        Le password corrispondono
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      label={
                        <span className="small">
                          Accetto i{' '}
                          <Link to="/terms" className="text-decoration-none">
                            Termini e Condizioni
                          </Link>{' '}
                          e la{' '}
                          <Link to="/privacy" className="text-decoration-none">
                            Privacy Policy
                          </Link>
                        </span>
                      }
                      className={validated && !acceptTerms ? 'is-invalid' : ''}
                    />
                    {validated && !acceptTerms && (
                      <div className="invalid-feedback d-block">
                        Devi accettare i termini e condizioni.
                      </div>
                    )}
                  </Form.Group>

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
                          Registrazione in corso...
                        </>
                      ) : (
                        'Registrati'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted small">Hai già un account? </span>
                  <Link to="/login" className="text-decoration-none">
                    Accedi
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