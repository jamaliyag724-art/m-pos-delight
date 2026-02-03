import React, { useMemo } from 'react';
import { Download, TrendingUp, Banknote, Smartphone, ShoppingBag, Star } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { formatPrice } from '@/data/menuData';
import { generateDailySummaryCSV, downloadCSV } from '@/utils/csvUtils';
import Navigation from '@/components/Navigation';

const Summary: React.FC = () => {
  const { orders } = usePOS();

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const cashOrders = orders.filter((o) => o.paymentMethod === 'cash');
    const upiOrders = orders.filter((o) => o.paymentMethod === 'upi');
    
    const cashTotal = cashOrders.reduce((sum, o) => sum + o.total, 0);
    const upiTotal = upiOrders.reduce((sum, o) => sum + o.total, 0);
    const grandTotal = cashTotal + upiTotal;

    // Find best-selling item
    const itemCounts: Record<string, { name: string; count: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItem.id;
        if (!itemCounts[key]) {
          itemCounts[key] = { name: item.menuItem.name, count: 0 };
        }
        itemCounts[key].count += item.quantity;
      });
    });

    const bestSeller = Object.values(itemCounts).sort((a, b) => b.count - a.count)[0];

    // Today's stats
    const today = new Date().toDateString();
    const todayOrders = orders.filter((o) => new Date(o.timestamp).toDateString() === today);
    const todayTotal = todayOrders.reduce((sum, o) => sum + o.total, 0);

    return {
      totalOrders,
      cashOrders: cashOrders.length,
      upiOrders: upiOrders.length,
      cashTotal,
      upiTotal,
      grandTotal,
      bestSeller,
      todayOrders: todayOrders.length,
      todayTotal,
    };
  }, [orders]);

  const handleExport = () => {
    if (orders.length === 0) return;
    const csv = generateDailySummaryCSV(orders);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `m2-summary-${date}.csv`);
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue,
    gradient = false,
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number;
    subValue?: string;
    gradient?: boolean;
  }) => (
    <div className={`pos-card p-6 ${gradient ? 'gold-gradient' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${gradient ? 'text-primary-foreground' : 'text-foreground'}`}>
            {value}
          </p>
          {subValue && (
            <p className={`text-sm mt-1 ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {subValue}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient ? 'bg-white/20' : 'bg-primary/10'}`}>
          <Icon className={`w-6 h-6 ${gradient ? 'text-primary-foreground' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="container mx-auto px-4 py-4 max-w-[1200px]">
        <Navigation />

        {/* Header */}
        <div className="pos-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">
                Sales Summary
              </h1>
              <p className="text-muted-foreground">
                Complete overview of your sales performance
              </p>
            </div>

            <button
              onClick={handleExport}
              disabled={orders.length === 0}
              className="pos-button-primary px-6 py-3 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Summary
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={TrendingUp}
            label="Grand Total Sales"
            value={formatPrice(stats.grandTotal)}
            subValue={`${stats.totalOrders} orders`}
            gradient
          />
          
          <StatCard
            icon={ShoppingBag}
            label="Today's Sales"
            value={formatPrice(stats.todayTotal)}
            subValue={`${stats.todayOrders} orders today`}
          />

          <StatCard
            icon={Star}
            label="Best Seller"
            value={stats.bestSeller?.name || 'No data'}
            subValue={stats.bestSeller ? `${stats.bestSeller.count} sold` : undefined}
          />
        </div>

        {/* Payment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="pos-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-100">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-display text-lg font-semibold">Cash Payments</h3>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(stats.cashTotal)}</p>
                <p className="text-sm text-muted-foreground">{stats.cashOrders} orders</p>
              </div>
              <div className="h-16 w-24 bg-emerald-100 rounded-lg flex items-end justify-center pb-1">
                <div 
                  className="w-16 bg-emerald-500 rounded-t-md transition-all duration-500"
                  style={{ 
                    height: `${stats.grandTotal > 0 ? (stats.cashTotal / stats.grandTotal) * 100 : 0}%`,
                    minHeight: stats.cashTotal > 0 ? '8px' : '0'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pos-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-violet-100">
                <Smartphone className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-display text-lg font-semibold">UPI Payments</h3>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(stats.upiTotal)}</p>
                <p className="text-sm text-muted-foreground">{stats.upiOrders} orders</p>
              </div>
              <div className="h-16 w-24 bg-violet-100 rounded-lg flex items-end justify-center pb-1">
                <div 
                  className="w-16 bg-violet-500 rounded-t-md transition-all duration-500"
                  style={{ 
                    height: `${stats.grandTotal > 0 ? (stats.upiTotal / stats.grandTotal) * 100 : 0}%`,
                    minHeight: stats.upiTotal > 0 ? '8px' : '0'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pos-card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalOrders > 0 ? formatPrice(Math.round(stats.grandTotal / stats.totalOrders)) : '₹0'}
              </p>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.cashOrders}</p>
              <p className="text-sm text-muted-foreground">Cash Orders</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{stats.upiOrders}</p>
              <p className="text-sm text-muted-foreground">UPI Orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
