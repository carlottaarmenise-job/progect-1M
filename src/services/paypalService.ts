export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'COMPLETED' | 'APPROVED' | 'CANCELLED' | 'FAILED';
  amount: {
    value: string;
    currency_code: string;
  };
  create_time: string;
  payer: {
    email: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
  details?: PayPalOrder;
}

class PayPalService {
  private baseURL = 'https://api-m.sandbox.paypal.com'; 
  private clientId = 'YOUR_PAYPAL_CLIENT_ID';
  private nodeRedURL = 'http://127.0.0.1:1880';

  // Simula la creazione di un ordine PayPal
  async createOrder(amount: number, currency: string = 'EUR'): Promise<PaymentResult> {
    try {
      await this.simulateDelay(1000);

      const orderId = this.generateOrderId();
      const order: PayPalOrder = {
        id: orderId,
        status: 'CREATED',
        amount: {
          value: amount.toFixed(2),
          currency_code: currency
        },
        create_time: new Date().toISOString(),
        payer: {
          email: 'buyer@example.com',
          name: {
            given_name: 'Test',
            surname: 'User'
          }
        }
      };

      // Salva l'ordine nel localStorage per il tracking
      this.saveOrderToStorage(order);

      return {
        success: true,
        orderId: orderId,
        details: order
      };
    } catch (error) {
      return {
        success: false,
        error: 'Errore nella creazione dell\'ordine PayPal'
      };
    }
  }

  // Simula il completamento del pagamento
  async completePayment(orderId: string): Promise<PaymentResult> {
    try {
      await this.simulateDelay(2000);

      // Simula il 90% di successo
      const isSuccess = Math.random() > 0.1;

      if (!isSuccess) {
        return {
          success: false,
          error: 'Pagamento rifiutato - Fondi insufficienti'
        };
      }

      const order = this.getOrderFromStorage(orderId);
      if (!order) {
        return {
          success: false,
          error: 'Ordine non trovato'
        };
      }

      // Aggiorna lo status dell'ordine
      order.status = 'COMPLETED';
      this.updateOrderInStorage(order);

      this.saveCompletedPayment(order);

      return {
        success: true,
        orderId: orderId,
        details: order
      };
    } catch (error) {
      return {
        success: false,
        error: 'Errore nel completamento del pagamento'
      };
    }
  }

  // Simula il pagamento con carta di credito
  async processCardPayment(cardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    name: string;
  }, amount: number): Promise<PaymentResult> {
    try {
      await this.simulateDelay(1500);

      // Validazione base della carta
      if (!this.isValidCard(cardData.number)) {
        return {
          success: false,
          error: 'Numero carta non valido'
        };
      }

      if (new Date(`${cardData.expiryYear}-${cardData.expiryMonth}-01`) < new Date()) {
        return {
          success: false,
          error: 'Carta scaduta'
        };
      }

      // Simula il 95% di successo per le carte
      const isSuccess = Math.random() > 0.05;

      if (!isSuccess) {
        return {
          success: false,
          error: 'Pagamento rifiutato dalla banca'
        };
      }

      const orderId = this.generateOrderId();
      const order: PayPalOrder = {
        id: orderId,
        status: 'COMPLETED',
        amount: {
          value: amount.toFixed(2),
          currency_code: 'EUR'
        },
        create_time: new Date().toISOString(),
        payer: {
          email: 'cardholder@example.com',
          name: {
            given_name: cardData.name.split(' ')[0] || 'Card',
            surname: cardData.name.split(' ')[1] || 'Holder'
          }
        }
      };

      this.saveCompletedPayment(order);

      return {
        success: true,
        orderId: orderId,
        details: order
      };
    } catch (error) {
      return {
        success: false,
        error: 'Errore nell\'elaborazione del pagamento'
      };
    }
  }

  // Statistiche dei pagamenti dall'API su  Node-RED
  async getPaymentStats() {
    try {
      const response = await fetch(`${this.nodeRedURL}/api/payment-stats`);
      if (!response.ok) {
        throw new Error('Errore nel caricamento statistiche');
      }
      return await response.json();
    } catch (error) {
      // Fallback ai dati di esempio
      console.error('Errore API Node-RED:', error);
      return {
        totalPayments: 0,
        totalRevenue: 0,
        paymentsToday: 0,
        revenueToday: 0,
        paymentsThisMonth: 0,
        revenueThisMonth: 0,
        paymentsLastMonth: 0,
        averageOrderValue: 0
      };
    }
  }

  // Dati per i grafici dall'API su Node-RED
  async getPaymentsForCharts() {
    try {
      const response = await fetch(`${this.nodeRedURL}/api/chart-data`);
      if (!response.ok) {
        throw new Error('Errore nel caricamento dati grafici');
      }
      return await response.json();
    } catch (error) {
      console.error('Errore API Node-RED:', error);
      return {
        dailyRevenue: [],
        monthlyComparison: []
      };
    }
  }

  // Metodi privati
  private generateOrderId(): string {
    return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isValidCard(number: string): boolean {
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
  }

  private saveOrderToStorage(order: PayPalOrder): void {
    const orders = JSON.parse(localStorage.getItem('paypal_orders') || '[]');
    orders.push(order);
    localStorage.setItem('paypal_orders', JSON.stringify(orders));
  }

  private getOrderFromStorage(orderId: string): PayPalOrder | null {
    const orders = JSON.parse(localStorage.getItem('paypal_orders') || '[]');
    return orders.find((order: PayPalOrder) => order.id === orderId) || null;
  }

  private updateOrderInStorage(updatedOrder: PayPalOrder): void {
    const orders = JSON.parse(localStorage.getItem('paypal_orders') || '[]');
    const index = orders.findIndex((order: PayPalOrder) => order.id === updatedOrder.id);
    if (index !== -1) {
      orders[index] = updatedOrder;
      localStorage.setItem('paypal_orders', JSON.stringify(orders));
    }
  }

  private saveCompletedPayment(order: PayPalOrder): void {
    const payments = JSON.parse(localStorage.getItem('completed_payments') || '[]');
    payments.push(order);
    localStorage.setItem('completed_payments', JSON.stringify(payments));
  }

  private getCompletedPayments(): PayPalOrder[] {
    return JSON.parse(localStorage.getItem('completed_payments') || '[]');
  }

  private getMonthlyComparison(payments: PayPalOrder[]) {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.create_time);
        return paymentDate >= date && paymentDate < nextMonth;
      });

      months.push({
        month: date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        revenue: monthPayments.reduce((sum, p) => sum + parseFloat(p.amount.value), 0),
        orders: monthPayments.length
      });
    }
    
    return months;
  }
}

export const paypalService = new PayPalService();