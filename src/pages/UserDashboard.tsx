import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Nav, Badge, Button, Form, Alert, Modal, Table, Spinner } from 'react-bootstrap';
import { User, Package, CreditCard, Settings, Eye, X, CheckCircle, Truck, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { orders, loading: ordersLoading, fetchOrders, cancelOrder } = useOrders();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [showOrderDetails, setShowOrderDetails] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [ordersInitialized, setOrdersInitialized] = useState(false);

  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    country: user?.country || 'Italia'
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Carica ordini solo quando l'utente va nella tab ordini o overview
  const loadOrders = async () => {
    if (!ordersInitialized) {
      try {
        await fetchOrders();
        setOrdersInitialized(true);
      } catch (error) {
        showToast('Errore nel caricamento degli ordini', 'warning');
      }
    }
  };

  // Carica ordini quando si entra in overview o orders tab
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        country: user.country || 'Italia'
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      await updateProfile(profileData);
      showToast('Profilo aggiornato con successo!', 'success');
    } catch (error) {
      showToast('Errore nell\'aggiornamento del profilo', 'danger');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Le password non corrispondono', 'warning');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('La password deve contenere almeno 6 caratteri', 'warning');
      return;
    }

    try {
      // Chiamata API per cambiare password
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Errore nel cambio password');
      }

      showToast('Password cambiata con successo!', 'success');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast('Errore nel cambio password', 'danger');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Sei sicuro di voler annullare questo ordine?')) {
      try {
        await cancelOrder(orderId);
        showToast('Ordine annullato con successo', 'success');
      } catch (error) {
        showToast('Errore nell\'annullamento dell\'ordine', 'danger');
      }
    }
  };

  const handleRefreshOrders = async () => {
    try {
      await fetchOrders();
      showToast('Ordini aggiornati', 'success');
    } catch (error) {
      showToast('Errore nell\'aggiornamento degli ordini', 'danger');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-warning" size={16} />;
      case 'processing': return <AlertCircle className="text-info" size={16} />;
      case 'shipped': return <Truck className="text-primary" size={16} />;
      case 'delivered': return <CheckCircle className="text-success" size={16} />;
      case 'cancelled': return <X className="text-danger" size={16} />;
      default: return <Clock className="text-secondary" size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'processing': return 'In elaborazione';
      case 'shipped': return 'Spedito';
      case 'delivered': return 'Consegnato';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;

  return (
    <div className="container-fluid py-4">
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div 
                  className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px' }}
                >
                  <User size={40} className="text-white" />
                </div>
              </div>
              <h5 className="mb-1">{user?.firstName} {user?.lastName}</h5>
              <p className="text-muted mb-0">{user?.email}</p>
            </Card.Body>
          </Card>

          <Nav variant="pills" className="flex-column">
            <Nav.Item className="mb-2">
              <Nav.Link 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')}
                className="d-flex align-items-center"
              >
                <Package className="me-2" size={18} />
                Panoramica
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
                className="d-flex align-items-center"
              >
                <CreditCard className="me-2" size={18} />
                I miei ordini
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-2">
              <Nav.Link 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                className="d-flex align-items-center"
              >
                <Settings className="me-2" size={18} />
                Profilo
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        <Col md={9}>
          {activeTab === 'overview' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Benvenuto, {user?.firstName}!</h3>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handleRefreshOrders}
                  disabled={ordersLoading}
                >
                  <RefreshCw className={`me-1 ${ordersLoading ? 'spin' : ''}`} size={16} />
                  Aggiorna
                </Button>
              </div>
              
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center border-primary">
                    <Card.Body>
                      <h4 className="text-primary">{totalOrders}</h4>
                      <p className="mb-0">Ordini totali</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-success">
                    <Card.Body>
                      <h4 className="text-success">€{totalSpent.toFixed(2)}</h4>
                      <p className="mb-0">Speso totale</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-info">
                    <Card.Body>
                      <h4 className="text-info">{completedOrders}</h4>
                      <p className="mb-0">Ordini completati</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-warning">
                    <Card.Body>
                      <h4 className="text-warning">{pendingOrders}</h4>
                      <p className="mb-0">Ordini in corso</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card>
                <Card.Header>
                  <h5 className="mb-0">Ultimi ordini</h5>
                </Card.Header>
                <Card.Body>
                  {ordersLoading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">Non hai ancora effettuato ordini.</p>
                      <Button variant="outline-primary" onClick={loadOrders}>
                        Carica ordini
                      </Button>
                    </div>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Ordine</th>
                          <th>Data</th>
                          <th>Stato</th>
                          <th>Totale</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{new Date(order.orderDate).toLocaleDateString('it-IT')}</td>
                            <td>
                              <Badge bg={getStatusBadgeVariant(order.status)} className="d-flex align-items-center gap-1 w-auto">
                                {getStatusIcon(order.status)}
                                {getStatusText(order.status)}
                              </Badge>
                            </td>
                            <td>€{order.total.toFixed(2)}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => setShowOrderDetails(order.id)}
                              >
                                <Eye size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>I miei ordini</h3>
                <div className="d-flex gap-2">
                  <Badge bg="secondary">{totalOrders} ordini</Badge>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleRefreshOrders}
                    disabled={ordersLoading}
                  >
                    <RefreshCw className={`me-1 ${ordersLoading ? 'spin' : ''}`} size={16} />
                    Aggiorna
                  </Button>
                </div>
              </div>

              {ordersLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-5">
                    <Package size={48} className="text-muted mb-3" />
                    <h5>Nessun ordine trovato</h5>
                    <p className="text-muted mb-3">Non hai ancora effettuato nessun ordine.</p>
                    <Button variant="outline-primary" onClick={loadOrders}>
                      Carica ordini
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <Card key={order.id} className="mb-3">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={2}>
                            <strong>#{order.id}</strong>
                            <br />
                            <small className="text-muted">
                              {new Date(order.orderDate).toLocaleDateString('it-IT')}
                            </small>
                          </Col>
                          <Col md={3}>
                            <div className="d-flex align-items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </div>
                            {order.trackingNumber && (
                              <small className="text-muted">
                                Tracking: {order.trackingNumber}
                              </small>
                            )}
                          </Col>
                          <Col md={2}>
                            <strong>€{order.total.toFixed(2)}</strong>
                            <br />
                            <small className="text-muted">
                              {order.items.length} prodotti
                            </small>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">
                              {order.paymentMethod}
                            </small>
                          </Col>
                          <Col md={2} className="text-end">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="me-2"
                              onClick={() => setShowOrderDetails(order.id)}
                            >
                              <Eye size={14} />
                            </Button>
                            {order.status === 'pending' && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <X size={14} />
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <h3 className="mb-4">Gestione Profilo</h3>
              
              <Row>
                <Col md={8}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">Informazioni personali</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleProfileSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Nome</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData(prev => ({
                                  ...prev,
                                  firstName: e.target.value
                                }))}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Cognome</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData(prev => ({
                                  ...prev,
                                  lastName: e.target.value
                                }))}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                            required
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Telefono</Form.Label>
                          <Form.Control
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              phone: e.target.value
                            }))}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Indirizzo</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileData.address}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              address: e.target.value
                            }))}
                          />
                        </Form.Group>

                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Città</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.city}
                                onChange={(e) => setProfileData(prev => ({
                                  ...prev,
                                  city: e.target.value
                                }))}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>CAP</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.zipCode}
                                onChange={(e) => setProfileData(prev => ({
                                  ...prev,
                                  zipCode: e.target.value
                                }))}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Paese</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.country}
                                onChange={(e) => setProfileData(prev => ({
                                  ...prev,
                                  country: e.target.value
                                }))}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Button 
                          type="submit" 
                          variant="primary"
                          disabled={profileLoading}
                        >
                          {profileLoading ? 'Salvando...' : 'Salva modifiche'}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Sicurezza</h5>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted mb-3">
                        Mantieni sicuro il tuo account cambiando regolarmente la password.
                      </p>
                      <Button 
                        variant="outline-warning"
                        onClick={() => setShowPasswordModal(true)}
                        className="w-100"
                      >
                        Cambia Password
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>

      {/* Modal dettagli ordine */}
      <Modal 
        show={showOrderDetails !== null} 
        onHide={() => setShowOrderDetails(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Dettagli Ordine #{showOrderDetails}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showOrderDetails && (
            <>
              {(() => {
                const order = orders.find(o => o.id === showOrderDetails);
                if (!order) return <p>Ordine non trovato</p>;
                
                return (
                  <>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h6>Informazioni ordine</h6>
                        <p className="mb-1"><strong>Data:</strong> {new Date(order.orderDate).toLocaleDateString('it-IT')}</p>
                        <p className="mb-1"><strong>Stato:</strong> {getStatusText(order.status)}</p>
                        <p className="mb-1"><strong>Totale:</strong> €{order.total.toFixed(2)}</p>
                        <p className="mb-1"><strong>Pagamento:</strong> {order.paymentMethod}</p>
                        {order.trackingNumber && (
                          <p className="mb-1"><strong>Tracking:</strong> {order.trackingNumber}</p>
                        )}
                      </Col>
                      <Col md={6}>
                        <h6>Indirizzo di spedizione</h6>
                        <p className="mb-1">{order.shippingAddress.name}</p>
                        <p className="mb-1">{order.shippingAddress.address}</p>
                        <p className="mb-1">
                          {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                        </p>
                        <p className="mb-1">{order.shippingAddress.country}</p>
                        {order.shippingAddress.phone && (
                          <p className="mb-1"><strong>Tel:</strong> {order.shippingAddress.phone}</p>
                        )}
                      </Col>
                    </Row>

                    <h6>Prodotti ordinati</h6>
                    <Table>
                      <thead>
                        <tr>
                          <th>Prodotto</th>
                          <th>Categoria</th>
                          <th>Prezzo</th>
                          <th>Quantità</th>
                          <th>Subtotale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  className="me-2 rounded"
                                />
                                {item.productName}
                              </div>
                            </td>
                            <td>{item.categoryName}</td>
                            <td>€{item.price.toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td>€{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {order.notes && (
                      <>
                        <h6>Note</h6>
                        <p>{order.notes}</p>
                      </>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal cambio password */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambia Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Password attuale</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nuova password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                minLength={6}
                required
              />
              <Form.Text className="text-muted">
                La password deve contenere almeno 6 caratteri
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Conferma nuova password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                required
              />
            </Form.Group>

            {passwordData.newPassword && passwordData.confirmPassword && 
             passwordData.newPassword !== passwordData.confirmPassword && (
              <Alert variant="warning">
                Le password non corrispondono
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={passwordData.newPassword !== passwordData.confirmPassword || 
                       passwordData.newPassword.length < 6}
            >
              Cambia Password
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDashboard;