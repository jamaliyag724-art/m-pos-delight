import React, { useState } from 'react';
import { Download, Search, Calendar, Clock, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { formatPrice } from '@/data/menuData';
import { exportOrdersToCSV, downloadCSV } from '@/utils/csvUtils';
import Navigation from '@/components/Navigation';

const History: React.FC = () => {
  const { orders } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'upi'>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm);
    
    const matchesFilter = filterMethod === 'all' || order.paymentMethod === filterMethod;
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    if (orders.length === 0) return;
    const csv = exportOrdersToCSV(orders);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `m2-orders-${date}.csv`);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="container mx-auto px-4 py-4 max-w-[1200px]">
        <Navigation />

        {/* Header */}
        <div className="pos-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                Order History
              </h1>
              <p className="text-muted-foreground">
                {orders.length} total order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={orders.length === 0}
              className="pos-button-primary px-6 py-3 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pos-input pl-10"
              />
            </div>

            {/* Payment filter */}
            <div className="flex gap-2">
              {(['all', 'cash', 'upi'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setFilterMethod(method)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterMethod === method
                      ? 'gold-gradient text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {method === 'all' ? 'All' : method.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="pos-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No orders found</p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Orders will appear here after checkout'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="pos-card p-4 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Order info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-primary text-lg">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {order.paymentMethod === 'cash' ? (
                          <><Banknote className="w-3 h-3 inline mr-1" />Cash</>
                        ) : (
                          <><Smartphone className="w-3 h-3 inline mr-1" />UPI</>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(order.timestamp)}
                      </span>
                      {order.customerName && (
                        <span>• {order.customerName}</span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded-lg bg-muted text-foreground"
                        >
                          {item.menuItem.name}
                          {item.cookingStyle && ` (${item.cookingStyle})`}
                          {item.quantity > 1 && ` ×${item.quantity}`}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gradient">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
