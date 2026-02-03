import React from 'react';
import { MenuItem, getCategoryLabel } from '@/data/menuData';
import MenuCard from './MenuCard';

interface MenuSectionProps {
  category: 'momos' | 'maggie' | 'combo';
  items: MenuItem[];
}

const MenuSection: React.FC<MenuSectionProps> = ({ category, items }) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'momos':
        return '🥟';
      case 'maggie':
        return '🍜';
      case 'combo':
        return '🎁';
      default:
        return '🍽️';
    }
  };

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{getCategoryIcon()}</span>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {getCategoryLabel(category)}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MenuSection;
