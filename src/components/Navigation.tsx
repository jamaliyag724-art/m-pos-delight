import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, History, BarChart3, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: ShoppingCart, label: 'Order' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/summary', icon: BarChart3, label: 'Summary' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="pos-card p-2 mb-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-4">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">M²</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">
              M² Maggie × Momos
            </h1>
            <p className="text-xs text-muted-foreground">Premium Street Food POS</p>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? 'nav-link-active' : 'nav-link-inactive'}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
