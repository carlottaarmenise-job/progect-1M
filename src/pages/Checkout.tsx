import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { paypalService, PaymentResult } from '../services/paypalService';
import type { CartItem } from '../types';

const Checkout: React.FC = () => {
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Italia',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');

  // Dati della carta
  const [cardData, setCardData] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    name: ''
  });

  // Calcoli 
  const subtotal = cartTotal;
  const shipping = subtotal > 50 ? 0 : 9.90;
  const tax = subtotal * 0.22; 
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    validateForm({ ...formData, [name]: value });
  };

  const validateForm = (data = formData) => {
    const newErrors: {[key: string]: string} = {};
    
    if (!data.firstName.trim()) newErrors.firstName = 'Nome richiesto';
    if (!data.lastName.trim()) newErrors.lastName = 'Cognome richiesto';
    if (!data.email.trim()) newErrors.email = 'Email richiesta';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Email non valida';
    if (!data.phone.trim()) newErrors.phone = 'Telefono richiesto';
    if (!data.address.trim()) newErrors.address = 'Indirizzo richiesto';
    if (!data.city.trim()) newErrors.city = 'Città richiesta';
    if (!data.postalCode.trim()) newErrors.postalCode = 'CAP richiesto';
    if (!data.province.trim()) newErrors.province = 'Provincia richiesta';
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = () => {
    if (!isFormValid) return;
    setShowPaymentModal(true);
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    
    if (field === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
    
    
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const isCardFormValid = () => {
    return cardData.number.replace(/\s/g, '').length >= 13 &&
           cardData.expiryMonth &&
           cardData.expiryYear &&
           cardData.cvv.length >= 3 &&
           cardData.name.trim().length > 0;
  };

  // Genera ID ordine univoco
  const generateOrderId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5);
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Crea ordine
      showToast('Creazione ordine PayPal...', 'info');
      const createResult = await paypalService.createOrder(total, 'EUR');
      
      if (!createResult.success) {
        throw new Error(createResult.error);
      }

      // Simula approvazione utente
      showToast('Reindirizzamento a PayPal...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Completa il pagamento
      showToast('Completamento pagamento...', 'info');
      const completeResult = await paypalService.completePayment(createResult.orderId!);
      
      if (completeResult.success) {
        handlePaymentSuccess(completeResult);
      } else {
        throw new Error(completeResult.error);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel pagamento';
      handlePaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const handleCardPayment = async () => {
    setIsProcessing(true);
    
    try {
      showToast('Elaborazione pagamento con carta...', 'info');
      
      const result = await paypalService.processCardPayment(cardData, total);
      
      if (result.success) {
        handlePaymentSuccess(result);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel pagamento';
      handlePaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
      setShowPaymentModal(false);
    }
  };

  const handlePaymentSuccess = async (result: PaymentResult) => {
    try {
      const orderData = {
        id: result.orderId || generateOrderId(),
        items: cartItems,
        customerData: formData,
        totals: {
          subtotal,
          shipping,
          tax,
          total
        },
        paymentDetails: result.details,
        orderDate: new Date().toISOString(),
        status: 'completed'
      };
      
      // Salva  nel localStorage
      const existingOrders = JSON.parse(localStorage.getItem('completed_orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('completed_orders', JSON.stringify(existingOrders));
      
      // Dati a Node-RED
      try {
        console.log('📤 Invio dati a Node-RED:', {
          orderId: orderData.id,
          itemsCount: cartItems.length,
          total: total,
          customerName: `${formData.firstName} ${formData.lastName}`
        });

        const nodeRedResponse = await fetch('http://127.0.0.1:1880/carrello', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderData.id,
            items: cartItems, 
            customerData: formData,
            totals: {
              subtotal,
              shipping,
              tax,
              total
            },
            paymentDetails: {
              id: result.orderId,
              method: paymentMethod,
              status: 'COMPLETED',
              amount: total
            },
            orderDate: orderData.orderDate,
            timestamp: new Date().toISOString()
          })
        });
        
        if (nodeRedResponse.ok) {
          console.log('✅ Dati inviati con successo a Node-RED');
        } else {
          console.warn('⚠️ Risposta Node-RED non OK:', nodeRedResponse.status);
        }
      } catch (nodeRedError) {
        console.warn('⚠️ Errore invio Node-RED (non blocca il processo):', nodeRedError);
      }
      
      clearCart();
      
      // Messaggio e reindirizza
      showToast('Ordine completato con successo!', 'success');
      navigate(`/order-success/${orderData.id}`);

    } catch (error) {
      console.error('Errore nel processamento dell\'ordine:', error);
      showToast('Errore nel processamento dell\'ordine', 'danger');
    }
  };

  const handlePaymentError = (error: string) => {
    showToast(`Errore nel pagamento: ${error}`, 'danger');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h3>Il tuo carrello è vuoto</h3>
            <p className="text-muted">Aggiungi alcuni prodotti per procedere al checkout.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Continua lo Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-4">
        <div className="row">
          <div className="col-12 mb-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <button className="btn btn-link p-0" onClick={() => navigate('/')}>
                    Home
                  </button>
                </li>
                <li className="breadcrumb-item">
                  <button className="btn btn-link p-0" onClick={() => navigate('/cart')}>
                    Carrello
                  </button>
                </li>
                <li className="breadcrumb-item active">Checkout</li>
              </ol>
            </nav>
            <h1 className="h3">
              <i className="fas fa-credit-card me-2"></i>
              Finalizza Ordine
            </h1>
          </div>
        </div>

        <div className="row">
          {/* Form dati cliente */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Dati di Fatturazione e Spedizione
                </h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nome *</label>
                      <input
                        type="text"
                        name="firstName"
                        className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Il tuo nome"
                      />
                      {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Cognome *</label>
                      <input
                        type="text"
                        name="lastName"
                        className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Il tuo cognome"
                      />
                      {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@esempio.com"
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Telefono *</label>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+39 123 456 7890"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Indirizzo *</label>
                    <input
                      type="text"
                      name="address"
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Via, Numero Civico"
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Città *</label>
                      <input
                        type="text"
                        name="city"
                        className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Milano"
                      />
                      {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">CAP *</label>
                      <input
                        type="text"
                        name="postalCode"
                        className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="20100"
                        maxLength={5}
                      />
                      {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Provincia *</label>
                      <input
                        type="text"
                        name="province"
                        className={`form-control ${errors.province ? 'is-invalid' : ''}`}
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="MI"
                        maxLength={2}
                      />
                      {errors.province && <div className="invalid-feedback">{errors.province}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Paese</label>
                    <select 
                      name="country" 
                      className="form-select" 
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option value="Italia">Italia</option>
                      <option value="San Marino">San Marino</option>
                      <option value="Vaticano">Città del Vaticano</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Note per la consegna (opzionale)</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Eventuali note per il corriere..."
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Riepilogo ordine */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Riepilogo Ordine
                </h5>
              </div>
              <div className="card-body">
                {/* Prodotti nel carrello */}
                <div className="mb-3">
                  {cartItems.map((item: CartItem) => (
                    <div key={item.product.id} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                      <img 
                        src={item.product.image || '/placeholder.jpg'} 
                        alt={item.product.name}
                        className="rounded"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 ms-3">
                        <div className="fw-semibold small">{item.product.name}</div>
                        <div className="text-muted small">Qty: {item.qty}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">€{(item.product.price * item.qty).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totali */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotale:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Spedizione:</span>
                    <span className={shipping === 0 ? 'text-success' : ''}>
                      {shipping === 0 ? 'Gratuita' : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="small text-success mb-2">
                      <i className="fas fa-check-circle me-1"></i>
                      Spedizione gratuita per ordini superiori a €50
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span>IVA (22%):</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-top pt-2 mt-2">
                    <div className="d-flex justify-content-between">
                      <strong>Totale:</strong>
                      <strong className="text-primary fs-5">€{total.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Informazioni aggiuntive */}
                <div className="mt-3">
                  <div className="alert alert-info">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-shield-alt me-2"></i>
                      <div>
                        <small className="fw-bold">Acquisto Sicuro</small>
                        <div className="small">Pagamenti protetti con SSL</div>
                      </div>
                    </div>
                  </div>
                  <div className="row text-center">
                    <div className="col-4">
                      <i className="fas fa-truck text-primary"></i>
                      <div className="small mt-1">Spedizione rapida</div>
                    </div>
                    <div className="col-4">
                      <i className="fas fa-undo text-primary"></i>
                      <div className="small mt-1">Reso facile</div>
                    </div>
                    <div className="col-4">
                      <i className="fas fa-headset text-primary"></i>
                      <div className="small mt-1">Supporto 24/7</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white">
                <button
                  type="button"
                  className={`btn btn-primary btn-lg w-100 ${!isFormValid ? 'opacity-50' : ''}`}
                  onClick={handleConfirmOrder}
                  disabled={!isFormValid || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Elaborazione...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card me-2"></i>
                      Conferma Ordine - €{total.toFixed(2)}
                    </>
                  )}
                </button>
                
                {!isFormValid && (
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Completa tutti i campi obbligatori per procedere
                    </small>
                  </div>
                )}

                {/* Metodi di pagamento accettati */}
                <div className="text-center mt-3">
                  <small className="text-muted d-block mb-2">Metodi di pagamento accettati:</small>
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <i className="fab fa-paypal fa-2x text-primary"></i>
                    <i className="fab fa-cc-visa fa-2x text-primary"></i>
                    <i className="fab fa-cc-mastercard fa-2x text-danger"></i>
                    <i className="fab fa-cc-amex fa-2x text-info"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal per selezionare il metodo di pagamento */}
      {showPaymentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-payment me-2"></i>
                  Seleziona Metodo di Pagamento
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      Totale da pagare: <strong>€{total.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Selezione metodo di pagamento */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div 
                      className={`card h-100 cursor-pointer ${paymentMethod === 'paypal' ? 'border-primary' : ''}`}
                      onClick={() => setPaymentMethod('paypal')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center">
                        <i className="fab fa-paypal fa-3x text-primary mb-2"></i>
                        <h6>PayPal</h6>
                        <small className="text-muted">Paga con il tuo account PayPal</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div 
                      className={`card h-100 cursor-pointer ${paymentMethod === 'card' ? 'border-primary' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <i className="fab fa-cc-visa fa-2x me-1"></i>
                          <i className="fab fa-cc-mastercard fa-2x me-1"></i>
                          <i className="fab fa-cc-amex fa-2x"></i>
                        </div>
                        <h6>Carta di Credito</h6>
                        <small className="text-muted">Visa, MasterCard, American Express</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form carta di credito */}
                {paymentMethod === 'card' && (
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">
                        <i className="fas fa-credit-card me-2"></i>
                        Dettagli Carta
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Numero Carta</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => handleCardInputChange('number', e.target.value)}
                            maxLength={19}
                          />
                        </div>
                        <div className="col-md-8 mb-3">
                          <label className="form-label">Nome Titolare</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Mario Rossi"
                            value={cardData.name}
                            onChange={(e) => handleCardInputChange('name', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2 mb-3">
                          <label className="form-label">Mese</label>
                          <select 
                            className="form-select"
                            value={cardData.expiryMonth}
                            onChange={(e) => handleCardInputChange('expiryMonth', e.target.value)}
                          >
                            <option value="">MM</option>
                            {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                              <option key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2 mb-3">
                          <label className="form-label">Anno</label>
                          <select 
                            className="form-select"
                            value={cardData.expiryYear}
                            onChange={(e) => handleCardInputChange('expiryYear', e.target.value)}
                          >
                            <option value="">YYYY</option>
                            {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(year => (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                >
                  Annulla
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={paymentMethod === 'paypal' ? handlePayPalPayment : handleCardPayment}
                  disabled={isProcessing || (paymentMethod === 'card' && !isCardFormValid())}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Elaborazione...
                    </>
                  ) : (
                    <>
                      <i className={`${paymentMethod === 'paypal' ? 'fab fa-paypal' : 'fas fa-credit-card'} me-2`}></i>
                      Paga con {paymentMethod === 'paypal' ? 'PayPal' : 'Carta'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;