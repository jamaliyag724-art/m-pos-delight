export type CookingStyle = 'Steam' | 'Fried' | null;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'momos' | 'maggie' | 'combo';
  pcs: number | null;
  cookingStyles: CookingStyle[];
  description: string | null;
  isJain?: boolean;
}

export const defaultMenuItems: MenuItem[] = [
  // MOMOS
  {
    id: 'trio-steam',
    name: 'The Trio',
    price: 50,
    category: 'momos',
    pcs: 3,
    cookingStyles: ['Steam'],
    description: 'Classic steamed momos trio',
    isJain: false,
  },
  {
    id: 'masala-magic',
    name: 'Masala Magic Momos',
    price: 99,
    category: 'momos',
    pcs: 7,
    cookingStyles: ['Steam', 'Fried'],
    description: 'Spicy masala-infused momos',
    isJain: false,
  },
  {
    id: 'paneer-momos',
    name: 'Paneer Momos',
    price: 120,
    category: 'momos',
    pcs: 8,
    cookingStyles: ['Steam', 'Fried'],
    description: 'Premium paneer-stuffed momos',
    isJain: false,
  },
  {
    id: 'jain-momos',
    name: 'Jain Momos',
    price: 120,
    category: 'momos',
    pcs: 8,
    cookingStyles: ['Steam', 'Fried'],
    description: 'No Onion | No Garlic',
    isJain: true,
  },
  // MAGGIE & DRINKS
  {
    id: 'cooker-maggie',
    name: 'Special Cooker Maggie Bowl',
    price: 70,
    category: 'maggie',
    pcs: null,
    cookingStyles: [null],
    description: 'Authentic pressure-cooked maggie',
    isJain: false,
  },
  {
    id: 'cold-drink',
    name: 'Cold Drink',
    price: 29,
    category: 'maggie',
    pcs: null,
    cookingStyles: [null],
    description: 'Chilled refreshment',
    isJain: false,
  },
  // COMBO
  {
    id: 'm2-combo',
    name: 'M² Combo',
    price: 160,
    category: 'combo',
    pcs: null,
    cookingStyles: [null],
    description: 'Maggie + Momos + Drink',
    isJain: false,
  },
];

export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'momos':
      return 'Momos';
    case 'maggie':
      return 'Maggie & Drinks';
    case 'combo':
      return 'Combo';
    default:
      return category;
  }
};

export const formatPrice = (price: number): string => {
  return `₹${price}`;
};
