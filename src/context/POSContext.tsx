import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MenuItem, CookingStyle, defaultMenuItems } from '@/data/menuData';

// Types
export interface BillItem {
  id: string;
  menuItem: MenuItem;
  cookingStyle: CookingStyle;
  quantity: number;
}

export interface Order {
  id: string;
  items: BillItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'cash' | 'upi';
  timestamp: Date;
}

interface POSState {
  menuItems: MenuItem[];
  billItems: BillItem[];
  orders: Order[];
  customerName: string;
  customerPhone: string;
}

type POSAction =
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'ADD_TO_BILL'; payload: { menuItem: MenuItem; cookingStyle: CookingStyle } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_FROM_BILL'; payload: string }
  | { type: 'CLEAR_BILL' }
  | { type: 'SET_CUSTOMER_NAME'; payload: string }
  | { type: 'SET_CUSTOMER_PHONE'; payload: string }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'LOAD_ORDERS'; payload: Order[] }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'UPDATE_ORDER_DISCOUNT'; payload: { orderId: string; discountPercent: number } };

const generateBillItemId = (menuItemId: string, cookingStyle: CookingStyle): string => {
  return `${menuItemId}-${cookingStyle || 'default'}-${Date.now()}`;
};

const generateOrderId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `M2-${year}-${random}`;
};

const posReducer = (state: POSState, action: POSAction): POSState => {
  switch (action.type) {
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };

    case 'ADD_TO_BILL': {
      const { menuItem, cookingStyle } = action.payload;
      const existingIndex = state.billItems.findIndex(
        (item) => item.menuItem.id === menuItem.id && item.cookingStyle === cookingStyle
      );

      if (existingIndex >= 0) {
        const updatedItems = [...state.billItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return { ...state, billItems: updatedItems };
      }

      const newItem: BillItem = {
        id: generateBillItemId(menuItem.id, cookingStyle),
        menuItem,
        cookingStyle,
        quantity: 1,
      };
      return { ...state, billItems: [...state.billItems, newItem] };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, billItems: state.billItems.filter((item) => item.id !== id) };
      }
      return {
        ...state,
        billItems: state.billItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }

    case 'REMOVE_FROM_BILL':
      return {
        ...state,
        billItems: state.billItems.filter((item) => item.id !== action.payload),
      };

    case 'CLEAR_BILL':
      return { ...state, billItems: [], customerName: '', customerPhone: '' };

    case 'SET_CUSTOMER_NAME':
      return { ...state, customerName: action.payload };

    case 'SET_CUSTOMER_PHONE':
      return { ...state, customerPhone: action.payload };

    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };

    case 'LOAD_ORDERS':
      return { ...state, orders: action.payload };

    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        billItems: [],
        orders: [],
        customerName: '',
        customerPhone: '',
      };

    case 'UPDATE_ORDER_DISCOUNT': {
      const { orderId, discountPercent } = action.payload;
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id === orderId) {
            const discountAmount = Math.round(order.subtotal * (discountPercent / 100));
            return {
              ...order,
              discountPercent,
              discountAmount,
              total: order.subtotal - discountAmount,
            };
          }
          return order;
        }),
      };
    }

    default:
      return state;
  }
};

const initialState: POSState = {
  menuItems: defaultMenuItems,
  billItems: [],
  orders: [],
  customerName: '',
  customerPhone: '',
};

interface POSContextType extends POSState {
  addToBill: (menuItem: MenuItem, cookingStyle: CookingStyle) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromBill: (id: string) => void;
  clearBill: () => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  processPayment: (method: 'cash' | 'upi', discountPercent?: number) => Order;
  getBillTotal: () => number;
  setMenuItems: (items: MenuItem[]) => void;
  clearAllData: () => void;
  applyDiscountToOrder: (orderId: string, discountPercent: number) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const ORDERS_STORAGE_KEY = 'm2_pos_orders';
const MENU_STORAGE_KEY = 'm2_pos_menu';

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders).map((order: Order) => ({
          ...order,
          timestamp: new Date(order.timestamp),
        }));
        dispatch({ type: 'LOAD_ORDERS', payload: parsedOrders });
      }

      const savedMenu = localStorage.getItem(MENU_STORAGE_KEY);
      if (savedMenu) {
        dispatch({ type: 'SET_MENU_ITEMS', payload: JSON.parse(savedMenu) });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(state.orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }, [state.orders]);

  // Save menu to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(state.menuItems));
    } catch (error) {
      console.error('Error saving menu to localStorage:', error);
    }
  }, [state.menuItems]);

  const addToBill = (menuItem: MenuItem, cookingStyle: CookingStyle) => {
    dispatch({ type: 'ADD_TO_BILL', payload: { menuItem, cookingStyle } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeFromBill = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_BILL', payload: id });
  };

  const clearBill = () => {
    dispatch({ type: 'CLEAR_BILL' });
  };

  const setCustomerName = (name: string) => {
    dispatch({ type: 'SET_CUSTOMER_NAME', payload: name });
  };

  const setCustomerPhone = (phone: string) => {
    dispatch({ type: 'SET_CUSTOMER_PHONE', payload: phone });
  };

  const setMenuItems = (items: MenuItem[]) => {
    dispatch({ type: 'SET_MENU_ITEMS', payload: items });
  };

  const clearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
    localStorage.removeItem(ORDERS_STORAGE_KEY);
  };

  const getBillTotal = (): number => {
    return state.billItems.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const processPayment = (method: 'cash' | 'upi', discountPercent: number = 0): Order => {
    const subtotal = getBillTotal();
    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const total = subtotal - discountAmount;

    const order: Order = {
      id: generateOrderId(),
      items: [...state.billItems],
      subtotal,
      discountPercent,
      discountAmount,
      total,
      customerName: state.customerName,
      customerPhone: state.customerPhone,
      paymentMethod: method,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_ORDER', payload: order });
    dispatch({ type: 'CLEAR_BILL' });

    return order;
  };

  const applyDiscountToOrder = (orderId: string, discountPercent: number) => {
    dispatch({ type: 'UPDATE_ORDER_DISCOUNT', payload: { orderId, discountPercent } });
  };

  const value: POSContextType = {
    ...state,
    addToBill,
    updateQuantity,
    removeFromBill,
    clearBill,
    setCustomerName,
    setCustomerPhone,
    processPayment,
    getBillTotal,
    setMenuItems,
    clearAllData,
    applyDiscountToOrder,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
