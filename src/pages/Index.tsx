import React from 'react';
import { usePOS } from '@/context/POSContext';
import MenuSection from '@/components/MenuSection';
import BillPanel from '@/components/BillPanel';
import Navigation from '@/components/Navigation';

const Index: React.FC = () => {
  const { menuItems } = usePOS();

  // Group items by category
  const momos = menuItems.filter((item) => item.category === 'momos');
  const maggie = menuItems.filter((item) => item.category === 'maggie');
  const combo = menuItems.filter((item) => item.category === 'combo');

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="container mx-auto px-4 py-4 max-w-[1600px]">
        <Navigation />
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Section */}
          <div className="flex-1 min-w-0">
            {combo.length > 0 && (
              <MenuSection category="combo" items={combo} />
            )}
            {momos.length > 0 && (
              <MenuSection category="momos" items={momos} />
            )}
            {maggie.length > 0 && (
              <MenuSection category="maggie" items={maggie} />
            )}
          </div>

          {/* Bill Panel - Sticky on desktop */}
          <div className="lg:w-[400px] lg:sticky lg:top-4 lg:self-start">
            <BillPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
