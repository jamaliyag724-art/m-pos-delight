import React, { useState } from 'react';
import { Minus, Plus, Trash2, Banknote, Smartphone, User, Phone, ShoppingBag } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { formatPrice } from '@/data/menuData';
import OrderConfirmation from './OrderConfirmation';
import { Order } from '@/context/POSContext';

const BillPanel: React.FC = () => {
  const {
    billItems,
    customerName,
    customerPhone,
    setCustomerName,
    setCustomerPhone,
    updateQuantity,
    removeFromBill,
    clearBill,
    processPayment,
    getBillTotal,
  } = usePOS();

  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handlePayment = (method: 'cash' | 'upi') => {
    if (billItems.length === 0) return;
    const order = processPayment(method);
    setCompletedOrder(order);
  };

  const total = getBillTotal();

  return (
    <>
      <div className="pos-card h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border gold-gradient">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
            <div>
              <h2 className="font-display text-xl font-semibold text-primary-foreground">
                Current Bill
              </h2>
              <p className="text-primary-foreground/80 text-sm">
                {billItems.length} item{billItems.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Customer Name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pos-input pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="pos-input pl-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bill Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {billItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">No items yet</p>
              <p className="text-muted-foreground/70 text-sm">
                Tap menu items to add them
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {billItems.map((item) => (
                <div key={item.id} className="bill-item animate-slide-up">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {item.menuItem.name}
                      </span>
                      {item.cookingStyle && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary shrink-0">
                          {item.cookingStyle}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(item.menuItem.price)} × {item.quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 rounded-md hover:bg-background transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 rounded-md hover:bg-background transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item total */}
                    <span className="font-semibold text-foreground min-w-[60px] text-right">
                      {formatPrice(item.menuItem.price * item.quantity)}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromBill(item.id)}
                      className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-card">
          {/* Total */}
          <div className="flex items-center justify-between mb-4 py-3 px-4 rounded-xl bg-muted">
            <span className="text-lg font-medium text-foreground">Grand Total</span>
            <span className="text-2xl font-bold text-gradient">{formatPrice(total)}</span>
          </div>

          {/* Payment buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePayment('cash')}
              disabled={billItems.length === 0}
              className="pos-button py-4 bg-emerald-500 text-white hover:bg-emerald-600 
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <Banknote className="w-5 h-5 mr-2" />
              Pay Cash
            </button>
            <button
              onClick={() => handlePayment('upi')}
              disabled={billItems.length === 0}
              className="pos-button py-4 bg-violet-500 text-white hover:bg-violet-600 
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Pay UPI
            </button>
          </div>

          {/* Clear button */}
          {billItems.length > 0 && (
            <button
              onClick={clearBill}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear Bill
            </button>
          )}
        </div>
      </div>

      {/* Order confirmation modal */}
      {completedOrder && (
        <OrderConfirmation
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </>
  );
};

export default BillPanel;
