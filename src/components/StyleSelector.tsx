import React from 'react';
import { X } from 'lucide-react';
import { MenuItem, CookingStyle } from '@/data/menuData';

interface StyleSelectorProps {
  item: MenuItem;
  onSelect: (style: CookingStyle) => void;
  onClose: () => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ item, onSelect, onClose }) => {
  const handleStyleSelect = (style: CookingStyle) => {
    onSelect(style);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-espresso/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative pos-card p-6 w-full max-w-sm mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="font-display text-xl font-semibold text-foreground mb-1">
            {item.name}
          </h3>
          <p className="text-muted-foreground text-sm">Choose cooking style</p>
        </div>

        {/* Style Options */}
        <div className="flex gap-3 justify-center">
          {item.cookingStyles.map((style) => (
            <button
              key={style || 'default'}
              onClick={() => handleStyleSelect(style)}
              className="flex-1 py-4 px-6 rounded-xl border-2 border-border bg-card 
                       hover:border-primary hover:bg-primary/5 transition-all duration-200
                       font-medium text-foreground active:scale-95"
            >
              {style || 'Regular'}
            </button>
          ))}
        </div>

        {/* Price info */}
        <div className="mt-6 text-center">
          <span className="text-lg font-semibold text-primary">₹{item.price}</span>
          {item.pcs && (
            <span className="text-muted-foreground text-sm ml-2">• {item.pcs} pcs</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;
