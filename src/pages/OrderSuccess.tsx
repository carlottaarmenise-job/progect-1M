import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

interface OrderDetails {
  id: string;
  items: any[];
  customerData: any;
  totals: any;
  paymentDetails: any;
  orderDate: string;
  status: string;
}

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      navigate('/');
    }
  }, [orderId, navigate]);

  const loadOrderDetails = (id: string) => {
    try {
      const orders = JSON.parse(localStorage.getItem('completed_orders') || '[]');
      const order = orders.find((o: OrderDetails) => o.id === id);
      
      if (order) {
        setOrderDetails(order);
      } else {
        showToast('Ordine non trovato', 'danger');
        navigate('/');
      }
    } catch (error) {
      showToast('Errore nel caricamento dell\'ordine', 'danger');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    showToast('Funzionalità in sviluppo - La fattura sarà inviata via email', 'info');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>Ordine non trovato</h4>
          <p>L'ordine richiesto non è stato trovato.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header successo */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8 text-center">
          <div className="mb-4">
            <div className="success-icon mx-auto mb-3" style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#28a745', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-check text-white fa-2x"></i>
            </div>
            <h1 className="text-success">Ordine Completato con Successo!</h1>
            <p className="lead order-success-title">
              Grazie per il tuo acquisto. Il tuo ordine è stato ricevuto e sarà processato a breve.
            </p>
          </div>

          <div className="alert alert-success border-0 shadow-sm">
            <div className="row align-items-center">
              <div className="col-md-8">
                <strong>Numero Ordine: #{orderDetails.id}</strong>
                <br />
                <small>Data: {new Date(orderDetails.orderDate).toLocaleString('it-IT')}</small>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="btn-group">
                  <button className="btn btn-outline-success btn-sm" onClick={handlePrintOrder}>
                    <i className="fas fa-print me-1"></i>
                    Stampa
                  </button>
                  <button className="btn btn-outline-primary btn-sm" onClick={handleDownloadInvoice}>
                    <i className="fas fa-download me-1"></i>
                    Fattura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Dettagli ordine */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0 order-details-header text-black">
                <i className="fas fa-shopping-bag me-2"></i>
                Dettagli Ordine
              </h5>
            </div>
            <div className="card-body">
              {/* Prodotti ordinati */}
              <h6 className="border-bottom pb-2 mb-3 order-section-subtitle">Prodotti Ordinati</h6>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="row align-items-center mb-3 pb-3 border-bottom">
                  <div className="col-md-2">
                    <img 
                      src={item.product?.image || '/placeholder.jpg'} 
                      alt={item.product?.name || 'Prodotto'}
                      className="img-fluid rounded"
                      style={{ maxHeight: '80px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-1 order-product-name">{item.product?.name || 'Prodotto'}</h6>
                    <small className="order-product-sku">SKU: {item.product?.id || 'N/A'}</small>
                  </div>
                  <div className="col-md-2 text-center">
                    <span className="badge bg-secondary">Qty: {item.qty || 1}</span>
                  </div>
                  <div className="col-md-2 text-end">
                    <strong className="order-price-main">€{((item.product?.price || 0) * (item.qty || 1)).toFixed(2)}</strong>
                    <br />
                    <small className="order-price-unit">€{(item.product?.price || 0).toFixed(2)} cad.</small>
                  </div>
                </div>
              ))}

              {/* Riepilogo totali */}
              <div className="row justify-content-end mt-4">
                <div className="col-md-6">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td className="order-total-label">Subtotale:</td>
                          <td className="text-end order-total-value">€{orderDetails.totals.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td className="order-total-label">Spedizione:</td>
                          <td className="text-end">
                            {orderDetails.totals.shipping === 0 ? (
                              <span className="text-success">Gratuita</span>
                            ) : (
                              <span className="order-total-value">€{orderDetails.totals.shipping.toFixed(2)}</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="order-total-label">IVA (22%):</td>
                          <td className="text-end order-total-value">€{orderDetails.totals.tax.toFixed(2)}</td>
                        </tr>
                        <tr className="table-success">
                          <td><strong className="order-total-value">Totale:</strong></td>
                          <td className="text-end"><strong className="order-total-value">€{orderDetails.totals.total.toFixed(2)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informazioni di spedizione */}
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-white">
              <h5 className="mb-0 order-section-title text-black">
                <i className="fas fa-truck me-2"></i>
                Informazioni di Spedizione
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="order-section-subtitle">Indirizzo di Spedizione</h6>
                  <address className="order-address-text">
                    <strong>{orderDetails.customerData.firstName} {orderDetails.customerData.lastName}</strong><br />
                    {orderDetails.customerData.address}<br />
                    {orderDetails.customerData.postalCode} {orderDetails.customerData.city} ({orderDetails.customerData.province})<br />
                    {orderDetails.customerData.country}<br />
                    <abbr title="Telefono">Tel:</abbr> {orderDetails.customerData.phone}<br />
                    <abbr title="Email">Email:</abbr> {orderDetails.customerData.email}
                  </address>
                </div>
                <div className="col-md-6">
                  <h6 className="order-section-subtitle">Stato Spedizione</h6>
                  <div className="order-timeline">
                    <div className="order-timeline-item completed">
                      <div className="order-timeline-marker bg-success"></div>
                      <div className="order-timeline-content">
                        <h6 className="order-timeline-title">Ordine Ricevuto</h6>
                        <p className="order-timeline-text">Il tuo ordine è stato ricevuto e confermato</p>
                        <small className="order-timeline-text">{new Date(orderDetails.orderDate).toLocaleString('it-IT')}</small>
                      </div>
                    </div>
                    <div className="order-timeline-item">
                      <div className="order-timeline-marker bg-warning"></div>
                      <div className="order-timeline-content">
                        <h6 className="order-timeline-title">Preparazione</h6>
                        <p className="order-timeline-text">Il tuo ordine è in preparazione</p>
                        <small className="order-timeline-text">Entro 24 ore</small>
                      </div>
                    </div>
                    <div className="order-timeline-item">
                      <div className="order-timeline-marker bg-secondary"></div>
                      <div className="order-timeline-content">
                        <h6 className="order-timeline-title">Spedizione</h6>
                        <p className="order-timeline-text">Il tuo ordine sarà spedito</p>
                        <small className="order-timeline-text">1-2 giorni lavorativi</small>
                      </div>
                    </div>
                    <div className="order-timeline-item">
                      <div className="order-timeline-marker bg-secondary"></div>
                      <div className="order-timeline-content">
                        <h6 className="order-timeline-title">Consegna</h6>
                        <p className="order-timeline-text">Il tuo ordine sarà consegnato</p>
                        <small className="order-timeline-text">2-3 giorni lavorativi</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {orderDetails.customerData.notes && (
                <div className="mt-3">
                  <h6 className="order-section-subtitle">Note per la Consegna</h6>
                  <div className="alert alert-info">
                    <i className="fas fa-sticky-note me-2"></i>
                    <span className="order-address-text text-black">{orderDetails.customerData.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar informazioni */}
        <div className="col-lg-4">
          {/* Informazioni di pagamento */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0 order-section-title text-black">
                <i className="fas fa-credit-card me-2"></i>
                Pagamento
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <i className="fas fa-check-circle fa-2x text-success"></i>
                </div>
                <div>
                  <h6 className="mb-0 order-payment-completed">Pagamento Completato</h6>
                  <small className="order-transaction-id">
                    Transazione ID: {orderDetails.paymentDetails?.id}
                  </small>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="row">
                  <div className="col-6">
                    <strong className="order-payment-amount-label">Importo Pagato:</strong>
                  </div>
                  <div className="col-6 text-end">
                    <strong className="text-success">€{orderDetails.totals.total.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <small className="order-transaction-id">Metodo:</small>
                  </div>
                  <div className="col-6 text-end">
                    <small className="order-payment-method">
                      {orderDetails.paymentDetails?.payer ? 'PayPal' : 'Carta di Credito'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prossimi passi */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0 order-section-title text-black">
                <i className="fas fa-tasks me-2"></i>
                Prossimi Passi
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="fas fa-envelope text-primary me-2"></i>
                  <span className="order-next-step-text">Riceverai un'email di conferma</span>
                </li>
                <li className="mb-2">
                  <i className="fas fa-warehouse text-info me-2"></i>
                  <span className="order-next-step-text">Il tuo ordine verrà preparato</span>
                </li>
                <li className="mb-2">
                  <i className="fas fa-shipping-fast text-warning me-2"></i>
                  <span className="order-next-step-text">Riceverai il tracking della spedizione</span>
                </li>
                <li className="mb-0">
                  <i className="fas fa-home text-success me-2"></i>
                  <span className="order-next-step-text">Consegna prevista in 2-3 giorni</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Supporto clienti */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0 order-section-title text-black">
                <i className="fas fa-headset me-2"></i>
                Serve Aiuto?
              </h5>
            </div>
            <div className="card-body">
              <p className="small mb-3 order-next-step-text">
                Il nostro team di supporto è sempre disponibile per aiutarti.
              </p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-comments me-1"></i>
                  Chat Live
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="fas fa-envelope me-1"></i>
                  Email Support
                </button>
                <button className="btn btn-outline-info btn-sm">
                  <i className="fas fa-phone me-1"></i>
                  Chiamaci
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="row mt-5">
        <div className="col-12 text-center">
          <div className="card bg-light">
            <div className="card-body py-4">
              <h5 className="order-final-title text-success">Grazie per aver scelto Manuzon!</h5>
              <p className="mb-3 order-final-text text-success">Continua a navigare per scoprire altri prodotti fantastici</p>
              <div className="btn-group">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Continua lo Shopping
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => showToast('Funzionalità tracciamento ordini in sviluppo', 'info')}
                >
                  <i className="fas fa-search me-2"></i>
                  Traccia Ordine
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;