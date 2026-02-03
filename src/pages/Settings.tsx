import React, { useRef, useState } from 'react';
import { Upload, Download, Trash2, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { defaultMenuItems } from '@/data/menuData';
import { 
  parseMenuCSV, 
  exportMenuToCSV, 
  generateMenuCSVTemplate,
  downloadCSV 
} from '@/utils/csvUtils';
import Navigation from '@/components/Navigation';

const Settings: React.FC = () => {
  const { menuItems, setMenuItems, orders, clearAllData } = usePOS();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const items = parseMenuCSV(content);
        
        if (items.length === 0) {
          setImportMessage({ type: 'error', text: 'No valid items found in CSV file' });
          return;
        }

        setMenuItems(items);
        setImportMessage({ type: 'success', text: `Successfully imported ${items.length} menu items` });
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setImportMessage({ type: 'error', text: 'Error parsing CSV file. Please check the format.' });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportMenu = () => {
    const csv = exportMenuToCSV(menuItems);
    downloadCSV(csv, 'm2-menu.csv');
  };

  const handleDownloadTemplate = () => {
    const template = generateMenuCSVTemplate();
    downloadCSV(template, 'm2-menu-template.csv');
  };

  const handleResetMenu = () => {
    setMenuItems(defaultMenuItems);
    setImportMessage({ type: 'success', text: 'Menu reset to default items' });
  };

  const handleClearData = () => {
    clearAllData();
    setShowConfirmClear(false);
    setImportMessage({ type: 'success', text: 'All order data has been cleared' });
  };

  return (
    <div className="min-h-screen bg-background bg-pattern">
      <div className="container mx-auto px-4 py-4 max-w-[800px]">
        <Navigation />

        {/* Header */}
        <div className="pos-card p-6 mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your menu and data
          </p>
        </div>

        {/* Import message */}
        {importMessage && (
          <div className={`pos-card p-4 mb-6 animate-slide-up ${
            importMessage.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-destructive'
          }`}>
            <p className={importMessage.type === 'success' ? 'text-emerald-700' : 'text-destructive'}>
              {importMessage.text}
            </p>
          </div>
        )}

        {/* Menu Management */}
        <div className="pos-card p-6 mb-6">
          <h2 className="font-display text-xl font-semibold mb-4">Menu Management</h2>
          
          <div className="space-y-4">
            {/* Import */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Import Menu from CSV</p>
                <p className="text-sm text-muted-foreground">Upload a CSV file to replace current menu</p>
              </div>
              <button onClick={handleImportClick} className="pos-button-primary px-4 py-2">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Export */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Export Current Menu</p>
                <p className="text-sm text-muted-foreground">Download menu as CSV ({menuItems.length} items)</p>
              </div>
              <button onClick={handleExportMenu} className="pos-button-outline px-4 py-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            {/* Template */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Download CSV Template</p>
                <p className="text-sm text-muted-foreground">Get a template to create your menu</p>
              </div>
              <button onClick={handleDownloadTemplate} className="pos-button-outline px-4 py-2">
                <FileText className="w-4 h-4 mr-2" />
                Template
              </button>
            </div>

            {/* Reset */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Reset to Default Menu</p>
                <p className="text-sm text-muted-foreground">Restore original M² menu items</p>
              </div>
              <button onClick={handleResetMenu} className="pos-button-outline px-4 py-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="pos-card p-6 mb-6">
          <h2 className="font-display text-xl font-semibold mb-4">Data Management</h2>

          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Clear All Order Data</p>
                <p className="text-sm text-muted-foreground mb-3">
                  This will permanently delete {orders.length} order{orders.length !== 1 ? 's' : ''}. This action cannot be undone.
                </p>
                
                {showConfirmClear ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearData}
                      className="pos-button bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2"
                    >
                      Yes, Clear All Data
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="pos-button bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    disabled={orders.length === 0}
                    className="pos-button bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Data
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Menu Preview */}
        <div className="pos-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Current Menu ({menuItems.length} items)</h2>
          
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.isJain && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Jain</span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.category} • {item.pcs ? `${item.pcs} pcs` : 'Single'}
                    {item.cookingStyles.length > 1 && ` • ${item.cookingStyles.join('/')}`}
                  </p>
                </div>
                <span className="font-semibold text-primary">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
