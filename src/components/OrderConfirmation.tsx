import React, { useRef } from 'react';
import { Check, Printer, X } from 'lucide-react';
import { Order } from '@/context/POSContext';
import { formatPrice } from '@/data/menuData';

interface OrderConfirmationProps {
  order: Order;
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>M² Maggie × Momos</h2>
            <p>Order #${order.id}</p>
            <p>${formatDate(order.timestamp)} at ${formatTime(order.timestamp)}</p>
          </div>
          <div class="divider"></div>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.menuItem.name}${item.cookingStyle ? ` (${item.cookingStyle})` : ''} × ${item.quantity}</span>
              <span>₹${item.menuItem.price * item.quantity}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="item total">
            <span>TOTAL</span>
            <span>₹${order.total}</span>
          </div>
          <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
          ${order.customerName ? `<p>Customer: ${order.customerName}</p>` : ''}
          ${order.customerPhone ? `<p>Phone: ${order.customerPhone}</p>` : ''}
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>Visit us again ❤️</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative pos-card p-6 w-full max-w-md mx-4 animate-scale-in" ref={receiptRef}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center animate-bounce-subtle">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">
            Order Confirmed!
          </h3>
          <p className="text-primary font-semibold text-lg">{order.id}</p>
          <p className="text-muted-foreground text-sm">
            {formatDate(order.timestamp)} at {formatTime(order.timestamp)}
          </p>
        </div>

        {/* Order details */}
        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.menuItem.name}
                  {item.cookingStyle && (
                    <span className="text-muted-foreground ml-1">({item.cookingStyle})</span>
                  )}
                  <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.menuItem.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border mt-3 pt-3 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-xl text-gradient">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Payment info */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.paymentMethod === 'cash' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-violet-100 text-violet-700'
          }`}>
            Paid via {order.paymentMethod.toUpperCase()}
          </span>
        </div>

        {/* Customer info */}
        {(order.customerName || order.customerPhone) && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            {order.customerName && <p>Customer: {order.customerName}</p>}
            {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 pos-button-outline py-3"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 pos-button-primary py-3"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
