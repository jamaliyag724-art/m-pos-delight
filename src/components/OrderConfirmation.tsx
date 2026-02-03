import React, { useRef, useState, useEffect } from 'react';
import { Check, Printer, X } from 'lucide-react';
import { Order } from '@/context/POSContext';
import { formatPrice } from '@/data/menuData';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePOS } from '@/context/POSContext';

interface OrderConfirmationProps {
  order: Order;
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { applyDiscountToOrder, orders } = usePOS();
  
  // Get the latest order data from context (in case discount was applied)
  const currentOrder = orders.find(o => o.id === order.id) || order;
  
  const [discountEnabled, setDiscountEnabled] = useState(currentOrder.discountPercent > 0);

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

  const handleDiscountToggle = (checked: boolean) => {
    setDiscountEnabled(checked);
    applyDiscountToOrder(order.id, checked ? 10 : 0);
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
          <title>Receipt - ${currentOrder.id}</title>
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
            .discount { color: #16a34a; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>M² Maggie × Momos</h2>
            <p>Order #${currentOrder.id}</p>
            <p>${formatDate(currentOrder.timestamp)} at ${formatTime(currentOrder.timestamp)}</p>
          </div>
          <div class="divider"></div>
          ${currentOrder.items.map(item => `
            <div class="item">
              <span>${item.menuItem.name}${item.cookingStyle ? ` (${item.cookingStyle})` : ''} × ${item.quantity}</span>
              <span>₹${item.menuItem.price * item.quantity}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="item">
            <span>Subtotal</span>
            <span>₹${currentOrder.subtotal}</span>
          </div>
          ${currentOrder.discountPercent > 0 ? `
            <div class="item discount">
              <span>Discount (${currentOrder.discountPercent}%)</span>
              <span>-₹${currentOrder.discountAmount}</span>
            </div>
          ` : ''}
          <div class="item total">
            <span>TOTAL</span>
            <span>₹${currentOrder.total}</span>
          </div>
          <p>Payment: ${currentOrder.paymentMethod.toUpperCase()}</p>
          ${currentOrder.customerName ? `<p>Customer: ${currentOrder.customerName}</p>` : ''}
          ${currentOrder.customerPhone ? `<p>Phone: ${currentOrder.customerPhone}</p>` : ''}
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
          <p className="text-primary font-semibold text-lg">{currentOrder.id}</p>
          <p className="text-muted-foreground text-sm">
            {formatDate(currentOrder.timestamp)} at {formatTime(currentOrder.timestamp)}
          </p>
        </div>

        {/* Order details */}
        <div className="bg-muted/50 rounded-xl p-4 mb-4">
          <div className="space-y-2">
            {currentOrder.items.map((item, index) => (
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
          
          {/* Subtotal, Discount, Total */}
          <div className="border-t border-border mt-3 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(currentOrder.subtotal)}</span>
            </div>
            
            {currentOrder.discountPercent > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount ({currentOrder.discountPercent}%)</span>
                <span className="font-medium">-{formatPrice(currentOrder.discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold text-foreground">Final Total</span>
              <span className="font-bold text-xl text-gradient">{formatPrice(currentOrder.total)}</span>
            </div>
          </div>
        </div>

        {/* Discount Toggle */}
        <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3 mb-4 border border-border">
          <Label htmlFor="discount-toggle" className="text-sm font-medium text-foreground cursor-pointer">
            Apply 10% Discount
          </Label>
          <Switch
            id="discount-toggle"
            checked={discountEnabled}
            onCheckedChange={handleDiscountToggle}
          />
        </div>

        {/* Payment info */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentOrder.paymentMethod === 'cash' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-violet-100 text-violet-700'
          }`}>
            Paid via {currentOrder.paymentMethod.toUpperCase()}
          </span>
        </div>

        {/* Customer info */}
        {(currentOrder.customerName || currentOrder.customerPhone) && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            {currentOrder.customerName && <p>Customer: {currentOrder.customerName}</p>}
            {currentOrder.customerPhone && <p>Phone: {currentOrder.customerPhone}</p>}
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
