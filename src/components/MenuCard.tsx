import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MenuItem, CookingStyle, formatPrice } from '@/data/menuData';
import { usePOS } from '@/context/POSContext';
import StyleSelector from './StyleSelector';

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToBill } = usePOS();
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  const handleClick = () => {
    // If item has multiple cooking styles, show selector
    if (item.cookingStyles.length > 1) {
      setShowStyleSelector(true);
    } else {
      // Add directly with the only available style
      addToBill(item, item.cookingStyles[0]);
    }
  };

  const handleStyleSelect = (style: CookingStyle) => {
    addToBill(item, style);
  };

  const getCategoryClass = () => {
    switch (item.category) {
      case 'momos':
        return 'category-momos';
      case 'maggie':
        return 'category-maggie';
      case 'combo':
        return 'category-combo';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="pos-card-hover p-4 flex flex-col h-full group"
      >
        {/* Header with category */}
        <div className="flex items-start justify-between mb-3">
          <span className={getCategoryClass()}>
            {item.category === 'combo' ? '🔥 Best Value' : item.category}
          </span>
          <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
            <Plus className="w-4 h-4" />
          </div>
        </div>

        {/* Item info */}
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">
            {item.name}
          </h3>
          
          {item.description && (
            <p className="text-muted-foreground text-sm mb-2">
              {item.description}
            </p>
          )}

          {/* Jain badge */}
          {item.isJain && (
            <span className="jain-badge mb-2">
              🌿 Jain
            </span>
          )}

          {/* Style options preview */}
          {item.cookingStyles.length > 1 && (
            <div className="flex gap-1 mb-2">
              {item.cookingStyles.map((style) => (
                <span
                  key={style}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {style}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer with price */}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-border/50">
          <div>
            <span className="text-xl font-bold text-gradient">
              {formatPrice(item.price)}
            </span>
            {item.pcs && (
              <span className="text-muted-foreground text-sm ml-1">
                • {item.pcs} pcs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Style selector modal */}
      {showStyleSelector && (
        <StyleSelector
          item={item}
          onSelect={handleStyleSelect}
          onClose={() => setShowStyleSelector(false)}
        />
      )}
    </>
  );
};

export default MenuCard;
