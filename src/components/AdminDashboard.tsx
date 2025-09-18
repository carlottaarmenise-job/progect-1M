import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Registra i componenti Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface OrderData {
  id: string;
  items: any[];
  customerData: any;
  totals: any;
  paymentDetails: any;
  orderDate: string;
  status: string;
}

interface DashboardStats {
  totalPayments: number;
  totalRevenue: number;
  paymentsToday: number;
  revenueToday: number;
  paymentsThisMonth: number;
  revenueThisMonth: number;
  paymentsLastMonth: number;
  revenueLastMonth: number;
  averageOrderValue: number;
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    try {
      // Carica ordini reali dal localStorage
      const completedOrders = JSON.parse(localStorage.getItem('completed_orders') || '[]');
      setOrders(completedOrders);
      
      // Calcola statistiche
      const calculatedStats = calculateStats(completedOrders);
      setStats(calculatedStats);
      
    } catch (error) {
      console.error('Errore caricamento dati:', error);
      setStats({
        totalPayments: 0,
        totalRevenue: 0,
        paymentsToday: 0,
        revenueToday: 0,
        paymentsThisMonth: 0,
        revenueThisMonth: 0,
        paymentsLastMonth: 0,
        revenueLastMonth: 0,
        averageOrderValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders: OrderData[]): DashboardStats => {
    const now = new Date();
    const today = now.toDateString();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let totalRevenue = 0;
    let revenueToday = 0;
    let revenueThisMonth = 0;
    let revenueLastMonth = 0;
    let paymentsToday = 0;
    let paymentsThisMonth = 0;
    let paymentsLastMonth = 0;

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const orderTotal = order.totals?.total || 0;

      // Totali generali
      totalRevenue += orderTotal;

      // Oggi
      if (orderDate.toDateString() === today) {
        revenueToday += orderTotal;
        paymentsToday++;
      }

      // Questo mese
      if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) {
        revenueThisMonth += orderTotal;
        paymentsThisMonth++;
      }

      // Mese scorso
      if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
        revenueLastMonth += orderTotal;
        paymentsLastMonth++;
      }
    });

    return {
      totalPayments: orders.length,
      totalRevenue,
      paymentsToday,
      revenueToday,
      paymentsThisMonth,
      revenueThisMonth,
      paymentsLastMonth,
      revenueLastMonth,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  };

  // Genera dati per grafici basati su ordini reali
  const generateChartsData = () => {
    if (orders.length === 0) {
      return {
        dailyRevenue: [],
        monthlyComparison: [],
        categoryData: {},
        paymentMethodData: {}
      };
    }

    // Raggruppa per giorni (ultimi 30 giorni)
    const dailyRevenue: { [key: string]: { revenue: number; orders: number } } = {};
    const last30Days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenue[dateStr] = { revenue: 0, orders: 0 };
      return dateStr;
    });

    // Raggruppa per categorie e metodi di pagamento
    const categoryCount: { [key: string]: number } = {};
    const paymentMethodCount: { [key: string]: number } = {};

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
      
      // Revenue giornaliero
      if (dailyRevenue[orderDate]) {
        dailyRevenue[orderDate].revenue += order.totals?.total || 0;
        dailyRevenue[orderDate].orders += 1;
      }

      // Conteggio categorie
      order.items?.forEach((item: any) => {
        const category = item.product?.category || 'Altri';
        categoryCount[category] = (categoryCount[category] || 0) + item.qty;
      });

      // Metodi di pagamento
      const paymentMethod = order.paymentDetails?.payer ? 'PayPal' : 'Carta di Credito';
      paymentMethodCount[paymentMethod] = (paymentMethodCount[paymentMethod] || 0) + 1;
    });

    // Raggruppa per mesi (ultimi 6 mesi)
    const monthlyRevenue: { [key: string]: { revenue: number; orders: number } } = {};
    const last6Months = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthKey = date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = { revenue: 0, orders: 0 };
      return { key: monthKey, month: date.getMonth(), year: date.getFullYear() };
    });

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const monthKey = orderDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
      
      if (monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey].revenue += order.totals?.total || 0;
        monthlyRevenue[monthKey].orders += 1;
      }
    });

    return {
      dailyRevenue: last30Days.map(date => ({
        date,
        ...dailyRevenue[date]
      })),
      monthlyComparison: last6Months.map(({ key }) => ({
        month: key,
        ...monthlyRevenue[key]
      })),
      categoryData: categoryCount,
      paymentMethodData: paymentMethodCount
    };
  };

  const chartsData = generateChartsData();

  // Configurazioni grafici
  const lineChartData = {
    labels: chartsData.dailyRevenue.map((item: any) => 
      new Date(item.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    ),
    datasets: [
      {
        label: 'Fatturato (€)',
        data: chartsData.dailyRevenue.map((item: any) => item.revenue),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0);
          }
        }
      }
    }
  };

  // Dati reali per grafico categorie
  const categoryLabels = Object.keys(chartsData.categoryData);
  const categoryValues = Object.values(chartsData.categoryData);
  
  const categoryPieData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Nessun dato'],
    datasets: [
      {
        data: categoryValues.length > 0 ? categoryValues : [1],
        backgroundColor: [
          '#8884d8',
          '#82ca9d',
          '#ffc658',
          '#ff7300',
          '#00ff88',
          '#ff6b6b',
          '#4ecdc4'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const barChartData = {
    labels: chartsData.monthlyComparison.map((item: any) => item.month),
    datasets: [
      {
        label: 'Fatturato (€)',
        data: chartsData.monthlyComparison.map((item: any) => item.revenue),
        backgroundColor: '#0d6efd',
        borderRadius: 4,
        yAxisID: 'y'
      },
      {
        label: 'Ordini',
        data: chartsData.monthlyComparison.map((item: any) => item.orders),
        backgroundColor: '#198754',
        borderRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          callback: function(value: any) {
            return '€' + value.toFixed(0);
          }
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Dati reali metodi di pagamento
  const paymentLabels = Object.keys(chartsData.paymentMethodData);
  const paymentValues = Object.values(chartsData.paymentMethodData);

  const paymentMethodData = {
    labels: paymentLabels.length > 0 ? paymentLabels : ['Nessun dato'],
    datasets: [
      {
        data: paymentValues.length > 0 ? paymentValues : [1],
        backgroundColor: [
          '#0070ba',
          '#28a745',
          '#ffc107',
          '#6c757d'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Calcola percentuali di crescita
  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueGrowth = stats ? calculateGrowthPercentage(stats.revenueThisMonth, stats.revenueLastMonth) : 0;
  const ordersGrowth = stats ? calculateGrowthPercentage(stats.paymentsThisMonth, stats.paymentsLastMonth) : 0;

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0 text-black">
              <i className="fas fa-chart-line me-2 text-primary"></i>
              Dashboard Admin
            </h1>
            <div className="d-flex gap-2">
              <div className="btn-group">
                <button 
                  className={`btn ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedPeriod('week')}
                >
                  Settimana
                </button>
                <button 
                  className={`btn ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedPeriod('month')}
                >
                  Mese
                </button>
                <button 
                  className={`btn ${selectedPeriod === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedPeriod('year')}
                >
                  Anno
                </button>
              </div>
              <button className="btn btn-success" onClick={loadDashboardData}>
                <i className="fas fa-sync-alt me-1"></i>
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards delle statistiche principali */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-gradient rounded-3 p-3">
                    <i className="fas fa-euro-sign text-white fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Fatturato Totale</div>
                  <div className="h4 mb-0 text-dark">€{stats?.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 }) || '0.00'}</div>
                  <div className={`${revenueGrowth >= 0 ? 'text-success' : 'text-danger'} small`}>
                    <i className={`fas ${revenueGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}></i>
                    {Math.abs(revenueGrowth).toFixed(1)}% vs mese scorso
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-gradient rounded-3 p-3">
                    <i className="fas fa-shopping-cart text-white fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Ordini Totali</div>
                  <div className="h4 mb-0 text-dark">{stats?.totalPayments.toLocaleString('it-IT') || '0'}</div>
                  <div className={`${ordersGrowth >= 0 ? 'text-success' : 'text-danger'} small`}>
                    <i className={`fas ${ordersGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}></i>
                    {Math.abs(ordersGrowth).toFixed(1)}% vs mese scorso
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-gradient rounded-3 p-3">
                    <i className="fas fa-chart-bar text-white fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Valore Medio Ordine</div>
                  <div className="h4 mb-0 text-dark">€{stats?.averageOrderValue.toFixed(2) || '0.00'}</div>
                  <div className="text-info small">
                    <i className="fas fa-calculator me-1"></i>
                    Media calcolata
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-gradient rounded-3 p-3">
                    <i className="fas fa-calendar-day text-white fa-lg"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <div className="text-muted small">Vendite Oggi</div>
                  <div className="h4 mb-0 text-dark">€{stats?.revenueToday.toFixed(2) || '0.00'}</div>
                  <div className="text-warning small">
                    <i className="fas fa-shopping-bag me-1"></i>
                    {stats?.paymentsToday || 0} ordini
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grafici principali */}
      <div className="row mb-4">
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3 text-dark">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Andamento Fatturato (Ultimi 30 giorni)
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Line data={lineChartData} options={{...lineChartOptions, maintainAspectRatio: false}} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 text-dark">
                <i className="fas fa-tags me-2 text-success "></i>
                Vendite per Categoria
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Doughnut data={categoryPieData} options={{...pieOptions, maintainAspectRatio: false}} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grafici secondari */}
      <div className="row mb-4">
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 text-dark">
                <i className="fas fa-chart-bar me-2 text-info"></i>
                Confronto Mensile
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Bar data={barChartData} options={{...barChartOptions, maintainAspectRatio: false}} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="card-title mb-0 text-dark">
                <i className="fas fa-credit-card me-2 text-warning"></i>
                Metodi di Pagamento
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <Pie data={paymentMethodData} options={{...pieOptions, maintainAspectRatio: false}} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella ordini recenti */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 text-dark">
                  <i className="fas fa-list me-2 text-primary"></i>
                  Ordini Recenti ({orders.length} totali)
                </h5>
                <button className="btn btn-primary btn-sm" onClick={loadDashboardData}>
                  <i className="fas fa-sync-alt me-1"></i>
                  Aggiorna
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 px-3 py-3">ID Ordine</th>
                        <th className="border-0 py-3">Cliente</th>
                        <th className="border-0 py-3">Data</th>
                        <th className="border-0 py-3">Importo</th>
                        <th className="border-0 py-3">Metodo</th>
                        <th className="border-0 py-3">Stato</th>
                        <th className="border-0 py-3">Prodotti</th>
                        <th className="border-0 py-3 text-end">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice().reverse().slice(0, 10).map((order) => (
                        <tr key={order.id}>
                          <td className="px-3 py-3">
                            <code className="text-primary">#{order.id.substring(0, 12)}...</code>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="fw-semibold">
                                {order.customerData?.firstName} {order.customerData?.lastName}
                              </div>
                              <div className="text-muted small">{order.customerData?.email}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>{new Date(order.orderDate).toLocaleDateString('it-IT')}</div>
                            <div className="text-muted small">
                              {new Date(order.orderDate).toLocaleTimeString('it-IT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="fw-semibold">€{order.totals?.total.toFixed(2)}</span>
                          </td>
                          <td className="py-3">
                            <span className={`badge ${order.paymentDetails?.payer ? 'bg-primary' : 'bg-success'}`}>
                              {order.paymentDetails?.payer ? 'PayPal' : 'Carta'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-success">Completato</span>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-info">{order.items?.length || 0} item</span>
                          </td>
                          <td className="py-3 text-end">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => window.open(`/order-success/${order.id}`, '_blank')}
                                title="Visualizza ordine"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => console.log('Download fattura:', order.id)}
                                title="Scarica fattura"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Nessun ordine trovato</h5>
                  <p className="text-muted">Gli ordini completati appariranno qui.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;