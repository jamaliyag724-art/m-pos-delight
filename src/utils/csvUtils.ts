import { MenuItem, CookingStyle } from '@/data/menuData';
import { Order } from '@/context/POSContext';

// Parse cooking styles from CSV
const parseCookingStyles = (styleStr: string): CookingStyle[] => {
  if (!styleStr || styleStr.trim() === '' || styleStr.toLowerCase() === 'null') {
    return [null];
  }
  return styleStr.split('|').map((s) => {
    const trimmed = s.trim();
    if (trimmed === 'Steam' || trimmed === 'Fried') {
      return trimmed as CookingStyle;
    }
    return null;
  }).filter((s, i, arr) => arr.indexOf(s) === i); // Remove duplicates
};

// Parse CSV string to MenuItem array
export const parseMenuCSV = (csvString: string): MenuItem[] => {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const items: MenuItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    try {
      const item: MenuItem = {
        id: values[headers.indexOf('id')]?.trim() || `item-${i}`,
        name: values[headers.indexOf('name')]?.trim() || 'Unknown Item',
        price: parseInt(values[headers.indexOf('price')]?.trim() || '0', 10),
        category: (values[headers.indexOf('category')]?.trim() || 'momos') as MenuItem['category'],
        pcs: values[headers.indexOf('pcs')]?.trim() ? parseInt(values[headers.indexOf('pcs')].trim(), 10) : null,
        cookingStyles: parseCookingStyles(values[headers.indexOf('cookingstyle')]?.trim() || ''),
        description: values[headers.indexOf('description')]?.trim() || null,
        isJain: values[headers.indexOf('isjain')]?.trim()?.toLowerCase() === 'true',
      };

      if (item.name && item.price > 0) {
        items.push(item);
      }
    } catch (error) {
      console.error(`Error parsing line ${i}:`, error);
    }
  }

  return items;
};

// Parse a single CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
};

// Generate menu CSV template
export const generateMenuCSVTemplate = (): string => {
  return 'id,name,price,category,pcs,cookingStyle,description,isJain\n' +
    'example-item,Example Momos,100,momos,8,Steam|Fried,Delicious momos,false\n';
};

// Export menu items to CSV
export const exportMenuToCSV = (items: MenuItem[]): string => {
  const headers = ['id', 'name', 'price', 'category', 'pcs', 'cookingStyle', 'description', 'isJain'];
  const rows = items.map((item) => [
    item.id,
    `"${item.name}"`,
    item.price.toString(),
    item.category,
    item.pcs?.toString() || '',
    item.cookingStyles.filter(Boolean).join('|') || '',
    item.description ? `"${item.description}"` : '',
    item.isJain?.toString() || 'false',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Export orders to CSV
export const exportOrdersToCSV = (orders: Order[]): string => {
  const headers = ['Order ID', 'Date', 'Time', 'Items', 'Total', 'Payment Method', 'Customer Name', 'Customer Phone'];
  
  const rows = orders.map((order) => {
    const date = new Date(order.timestamp);
    const dateStr = date.toLocaleDateString('en-IN');
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const itemsStr = order.items.map((item) => 
      `${item.menuItem.name}${item.cookingStyle ? ` (${item.cookingStyle})` : ''} x${item.quantity}`
    ).join('; ');

    return [
      order.id,
      dateStr,
      timeStr,
      `"${itemsStr}"`,
      order.total.toString(),
      order.paymentMethod.toUpperCase(),
      order.customerName || '',
      order.customerPhone || '',
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Generate daily summary CSV
export const generateDailySummaryCSV = (orders: Order[]): string => {
  // Group orders by date
  const ordersByDate: Record<string, Order[]> = {};
  
  orders.forEach((order) => {
    const date = new Date(order.timestamp).toLocaleDateString('en-IN');
    if (!ordersByDate[date]) {
      ordersByDate[date] = [];
    }
    ordersByDate[date].push(order);
  });

  const headers = ['Date', 'Total Orders', 'Cash Orders', 'UPI Orders', 'Cash Amount', 'UPI Amount', 'Total Sales'];
  
  const rows = Object.entries(ordersByDate).map(([date, dayOrders]) => {
    const cashOrders = dayOrders.filter((o) => o.paymentMethod === 'cash');
    const upiOrders = dayOrders.filter((o) => o.paymentMethod === 'upi');
    const cashTotal = cashOrders.reduce((sum, o) => sum + o.total, 0);
    const upiTotal = upiOrders.reduce((sum, o) => sum + o.total, 0);

    return [
      date,
      dayOrders.length.toString(),
      cashOrders.length.toString(),
      upiOrders.length.toString(),
      cashTotal.toString(),
      upiTotal.toString(),
      (cashTotal + upiTotal).toString(),
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

// Download helper
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
