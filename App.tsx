import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  IconHome, IconBox, IconScan, IconHistory, IconSettings, 
  IconPlus, IconSearch, IconChevronLeft, IconAlert, IconCamera,
  IconDownload, IconUpload, IconFileText, IconX
} from './components/Icons';
import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS, INITIAL_USERS } from './constants';
import { Product, StockMovement, User, UserRole, MovementType, DashboardStats } from './types';

// --- Services (Mocking Backend) ---

const loadState = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

const saveState = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Components ---

const Button = ({ 
  children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false, type = "button" 
}: { 
  children?: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  const baseStyle = "h-12 px-4 rounded-xl font-semibold transition-all flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-accent text-white shadow-lg shadow-brand-accent/20",
    secondary: "bg-brand-surface text-white border border-gray-700",
    danger: "bg-red-500 text-white",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  value, onChange, placeholder, type = "text", icon, label, disabled = false 
}: { 
  value: string | number; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  type?: string; 
  icon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
}) => (
  <div className="mb-3">
    {label && <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">{label}</label>}
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-12 bg-brand-surface border border-gray-700 rounded-xl px-4 pl-10 text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent placeholder-gray-600 disabled:opacity-50 disabled:bg-gray-800"
      />
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
    </div>
  </div>
);

const Card = ({ children, className = "", onClick }: { children?: React.ReactNode; className?: string; onClick?: () => void; key?: React.Key }) => (
  <div onClick={onClick} className={`bg-brand-surface border border-gray-800 rounded-2xl p-4 ${className} ${onClick ? 'active:bg-gray-800 transition-colors cursor-pointer' : ''}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }: { children?: React.ReactNode; color?: "blue" | "red" | "yellow" | "green" | "gray" }) => {
  const colors = {
    blue: "bg-blue-900/50 text-blue-200 border-blue-800",
    red: "bg-red-900/50 text-red-200 border-red-800",
    yellow: "bg-yellow-900/50 text-yellow-200 border-yellow-800",
    green: "bg-green-900/50 text-green-200 border-green-800",
    gray: "bg-gray-800 text-gray-400 border-gray-700"
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Modal Scanner Component ---

const ScannerModal = ({ 
  onScan, onClose 
}: { 
  onScan: (code: string) => void;
  onClose: () => void;
}) => {
  const [manualCode, setManualCode] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-fade-in">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-white">
          <IconX />
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6">
        {/* Camera Viewport Simulation */}
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
        <div className="relative z-10 w-64 h-64 border-2 border-brand-accent rounded-3xl overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.7)] flex items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent/50 animate-[scan_2s_ease-in-out_infinite]"></div>
          <p className="text-white/50 text-sm">Align barcode within frame</p>
        </div>
        
        <div className="absolute bottom-10 w-full px-8 z-20">
           <Button 
            onClick={() => onScan('123456789')}
            className="w-full bg-white text-black mb-4 h-14"
          >
            <IconCamera className="mr-2" /> Simulate Scan
          </Button>

          <div className="bg-brand-surface p-4 rounded-xl border border-gray-700">
             <p className="text-xs text-gray-400 mb-2">Or enter manually:</p>
             <div className="flex gap-2">
               <input 
                  className="flex-1 bg-brand-dark border border-gray-600 rounded-lg px-3 text-white h-10"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="Barcode..."
               />
               <Button variant="secondary" className="h-10" onClick={() => manualCode && onScan(manualCode)}>Go</Button>
             </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(250px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// --- Views ---

// 1. Login View
const LoginView = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('admin@v254.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = INITIAL_USERS.find(u => u.email === email);
    if (user && password === 'password') {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-brand-dark">
      <div className="w-20 h-20 bg-gradient-to-br from-brand-accent to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-accent/20">
        <span className="text-3xl font-bold text-white">V</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">V254 Inventory</h1>
      <p className="text-gray-400 mb-8">Sign in to manage stock</p>
      
      <div className="w-full max-w-sm space-y-4">
        <Input value={email} onChange={setEmail} placeholder="Email" label="Email Address" />
        <Input value={password} onChange={setPassword} type="password" placeholder="Password" label="Password" />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <Button onClick={handleLogin} fullWidth>Sign In</Button>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-600">
        <p>Demo Credentials:</p>
        <p>Admin: admin@v254.com / password</p>
        <p>Staff: staff@v254.com / password</p>
      </div>
    </div>
  );
};

// 2. Dashboard View
const DashboardView = ({ 
  stats, bestSellers, onNavigate 
}: { 
  stats: DashboardStats; 
  bestSellers: { name: string; qty: number }[];
  onNavigate: (view: string) => void 
}) => {
  return (
    <div className="p-4 space-y-4 pb-24 animate-fade-in">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold border-2 border-brand-dark">
          AD
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Stock</p>
          <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
        </Card>
        <Card className="bg-gradient-to-br from-brand-accent to-red-600 border-none" onClick={() => onNavigate('inventory?filter=low')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-xs uppercase font-bold tracking-wider mb-1">Alerts</p>
              <p className="text-3xl font-bold text-white">{stats.lowStockCount + stats.expiredCount}</p>
            </div>
            <IconAlert className="text-white/50" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Movements Today</p>
          <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">Live</span>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-white">{stats.movementsToday}</p>
          <p className="text-sm text-gray-500 mb-1">transactions</p>
        </div>
      </Card>

      <div className="pt-2">
        <h3 className="text-lg font-bold text-white mb-3">Best Sellers</h3>
        <div className="space-y-2">
          {bestSellers.length > 0 ? bestSellers.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-brand-surface p-3 rounded-xl border border-gray-800">
              <span className="text-sm font-medium text-white truncate flex-1">{idx + 1}. {item.name}</span>
              <span className="text-sm font-bold text-brand-accent">{item.qty} Sold</span>
            </div>
          )) : (
            <p className="text-gray-500 text-sm">No sales data yet.</p>
          )}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => onNavigate('scan')}>
            <IconScan className="mr-2" /> Scan Item
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('add-product')}>
            <IconPlus className="mr-2" /> Add New
          </Button>
        </div>
      </div>
    </div>
  );
};

// 3. Inventory List View
const InventoryView = ({ 
  products, onSelect, initialFilter 
}: { 
  products: Product[]; 
  onSelect: (p: Product) => void;
  initialFilter?: string;
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter || 'all');

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'low') matchesFilter = p.stock <= p.lowStockThreshold;
    if (filter === 'out') matchesFilter = p.stock === 0;
    if (filter === 'expired') matchesFilter = p.expiryDate ? p.expiryDate < Date.now() : false;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="p-4 bg-brand-dark sticky top-0 z-10 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Inventory</h2>
        <Input 
          value={search} 
          onChange={setSearch} 
          placeholder="Search Name, SKU, Category..." 
          icon={<IconSearch className="w-5 h-5" />} 
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'low', label: 'Low Stock' },
            { id: 'out', label: 'No Stock' },
            { id: 'expired', label: 'Expired' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                filter === f.id 
                  ? 'bg-white text-brand-dark border-white' 
                  : 'bg-brand-surface text-gray-400 border-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No products found.</div>
        ) : (
          filtered.map(p => {
            const isLow = p.stock <= p.lowStockThreshold;
            const isExpired = p.expiryDate && p.expiryDate < Date.now();
            
            return (
              <Card key={p.id} onClick={() => onSelect(p)} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                  {p.imagePath ? (
                     <img src={p.imagePath} alt={p.name} className="w-full h-full object-cover opacity-80" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-600"><IconBox /></div>
                  )}
                  {isExpired && <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center"><IconAlert className="w-6 h-6 text-white" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{p.sku}</span>
                    <span className="text-xs text-gray-500">• {p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isLow || isExpired ? 'text-brand-accent' : 'text-white'}`}>
                    {p.stock}
                  </p>
                  <p className="text-xs text-gray-500">Unit</p>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
};

// 4. Product Detail & Movement View
const ProductDetailView = ({ 
  product, onBack, onMove 
}: { 
  product: Product; 
  onBack: () => void;
  onMove: (qty: number, type: MovementType, reason: string) => void;
}) => {
  const [tab, setTab] = useState<'info' | 'move'>('info');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('Sale');

  const handleStockUpdate = (type: MovementType) => {
    const q = parseInt(qty);
    if (!q || q <= 0) return;
    onMove(q, type, reason);
    setQty('');
    setTab('info');
  };

  const isExpired = product.expiryDate ? product.expiryDate < Date.now() : false;

  return (
    <div className="h-full flex flex-col bg-brand-dark pb-20 overflow-y-auto">
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-brand-dark/95 backdrop-blur z-20 border-b border-gray-800">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <IconChevronLeft />
        </button>
        <h1 className="text-lg font-bold truncate flex-1">{product.name}</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Header Card */}
        <div className="flex gap-4">
           <div className="w-24 h-24 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative">
             <img src={product.imagePath} className="w-full h-full object-cover" />
           </div>
           <div className="flex-1 flex flex-col justify-center">
             <div className="flex flex-wrap gap-2 mb-2">
               <Badge color={product.stock <= product.lowStockThreshold ? 'red' : 'blue'}>
                  {product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock'}
               </Badge>
               {isExpired && <Badge color="red">Expired</Badge>}
             </div>
             <p className="text-gray-400 text-sm">SKU: {product.sku}</p>
             <p className="text-2xl font-bold text-white mt-1">{product.stock} <span className="text-sm font-normal text-gray-500">units</span></p>
           </div>
        </div>

        {/* Action Tabs */}
        <div className="bg-brand-surface p-1 rounded-xl flex">
          <button 
            onClick={() => setTab('info')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'info' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          >
            Details
          </button>
          <button 
            onClick={() => setTab('move')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'move' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
          >
            Stock Adjust
          </button>
        </div>

        {tab === 'info' ? (
          <div className="space-y-4 animate-fade-in">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-surface p-3 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase">Cost Price</p>
                  <p className="text-lg font-semibold">KES {product.costPrice}</p>
                </div>
                <div className="bg-brand-surface p-3 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase">Sell Price</p>
                  <p className="text-lg font-semibold text-brand-accent">KES {product.sellPrice}</p>
                </div>
             </div>
             <div className="bg-brand-surface p-4 rounded-xl border border-gray-800">
                <h3 className="font-bold text-white mb-4">Product Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white">{product.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Supplier</span>
                    <span className="text-white text-right">{product.supplier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Barcode</span>
                    <span className="font-mono text-white">{product.barcode}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Expiry</span>
                    <span className={`${isExpired ? 'text-red-400 font-bold' : 'text-white'}`}>
                      {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <h3 className="font-bold text-white mb-4 text-center">Update Stock Level</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                 {[1, 5, 10, 20, 50, 100].map(n => (
                   <button 
                    key={n}
                    onClick={() => setQty(n.toString())}
                    className="bg-brand-dark border border-gray-700 rounded py-2 text-sm font-medium hover:border-brand-accent focus:border-brand-accent"
                   >
                     {n}
                   </button>
                 ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button 
                  className="w-12 h-12 bg-gray-700 rounded-lg text-2xl"
                  onClick={() => setQty(prev => Math.max(0, (parseInt(prev)||0) - 1).toString())}
                >-</button>
                <input 
                  type="number" 
                  value={qty} 
                  onChange={e => setQty(e.target.value)}
                  className="flex-1 h-12 bg-brand-dark border border-gray-700 rounded-lg text-center text-xl font-bold focus:border-brand-accent outline-none"
                  placeholder="0"
                />
                <button 
                  className="w-12 h-12 bg-gray-700 rounded-lg text-2xl"
                  onClick={() => setQty(prev => ((parseInt(prev)||0) + 1).toString())}
                >+</button>
              </div>

              <div className="mb-6">
                <label className="text-xs text-gray-400 mb-1 block">Reason</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-brand-dark border border-gray-700 h-10 rounded-lg px-3 text-white"
                >
                  <option>Sale</option>
                  <option>Restock</option>
                  <option>Return</option>
                  <option>Damage/Loss</option>
                  <option>Audit Correction</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <Button variant="danger" onClick={() => handleStockUpdate(MovementType.OUT)}>
                    STOCK OUT
                 </Button>
                 <Button variant="primary" onClick={() => handleStockUpdate(MovementType.IN)}>
                    STOCK IN
                 </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Add Product Form View
const AddProductView = ({ 
  onSave, onCancel, onRequestScan 
}: { 
  onSave: (p: Product) => void;
  onCancel: () => void;
  onRequestScan: (callback: (code: string) => void) => void;
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Vibrators',
    supplier: '',
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    barcode: '',
    expiryDate: null
  });
  const [expiryString, setExpiryString] = useState('');

  // Handle SKU Generation
  useEffect(() => {
    if (!formData.sku) {
      setFormData(prev => ({ ...prev, sku: `V254-${Date.now().toString().slice(-6)}`}));
    }
  }, []);

  const handleChange = (field: keyof Product, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleScanClick = () => {
    onRequestScan((code) => {
      handleChange('barcode', code);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellPrice) {
      alert('Name and Selling Price are required');
      return;
    }
    
    const newProduct: Product = {
      id: Date.now().toString(),
      sku: formData.sku!,
      name: formData.name!,
      barcode: formData.barcode || 'N/A',
      category: formData.category!,
      supplier: formData.supplier || 'N/A',
      costPrice: Number(formData.costPrice),
      sellPrice: Number(formData.sellPrice),
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold),
      expiryDate: expiryString ? new Date(expiryString).getTime() : null,
      imagePath: 'https://picsum.photos/200/200?random=' + Math.floor(Math.random() * 1000)
    };
    onSave(newProduct);
  };

  return (
    <div className="h-full flex flex-col bg-brand-dark pb-20 overflow-y-auto">
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-brand-dark/95 backdrop-blur z-20 border-b border-gray-800">
        <button onClick={onCancel} className="text-gray-400">Cancel</button>
        <h1 className="text-lg font-bold flex-1 text-center">Add New Product</h1>
        <button onClick={handleSubmit as any} className="text-brand-accent font-bold">Save</button>
      </div>

      <form className="p-4 space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-4">
           <div className="w-24 h-24 bg-brand-surface border border-gray-700 rounded-xl flex items-center justify-center text-gray-500">
             <IconCamera />
           </div>
           <div className="flex-1 space-y-2">
              <Input label="Product Name" value={formData.name || ''} onChange={v => handleChange('name', v)} placeholder="e.g. Magic Wand" />
              <Input label="SKU (Auto)" value={formData.sku || ''} onChange={() => {}} disabled />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Category" value={formData.category || ''} onChange={v => handleChange('category', v)} placeholder="Category" />
          <Input label="Supplier" value={formData.supplier || ''} onChange={v => handleChange('supplier', v)} placeholder="Supplier Name" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Cost Price" type="number" value={formData.costPrice || 0} onChange={v => handleChange('costPrice', v)} />
          <Input label="Selling Price" type="number" value={formData.sellPrice || 0} onChange={v => handleChange('sellPrice', v)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Initial Stock" type="number" value={formData.stock || 0} onChange={v => handleChange('stock', v)} />
          <Input label="Low Alert Limit" type="number" value={formData.lowStockThreshold || 5} onChange={v => handleChange('lowStockThreshold', v)} />
        </div>

        <Input 
            label="Expiry Date (Optional)" 
            type="date" 
            value={expiryString} 
            onChange={v => setExpiryString(v)} 
        />

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Barcode</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input value={formData.barcode || ''} onChange={v => handleChange('barcode', v)} placeholder="Scan or type..." />
            </div>
            <Button variant="secondary" onClick={handleScanClick} className="h-12 w-12 !px-0">
               <IconScan />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// 6. Settings & Backup View
const SettingsView = ({ 
  user, onLogout, onBackup, onRestore, onExport 
}: { 
  user: User; 
  onLogout: () => void; 
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 flex flex-col h-full pb-24 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-gray-400 capitalize">{user.role}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase text-gray-500 font-bold ml-1 mb-2">Data Management</h3>
        <Button variant="secondary" fullWidth onClick={onExport} className="justify-start">
          <IconFileText className="mr-3 text-brand-accent" /> Export Inventory (CSV)
        </Button>
        <Button variant="secondary" fullWidth onClick={onBackup} className="justify-start">
          <IconDownload className="mr-3 text-blue-400" /> Backup Data (JSON)
        </Button>
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onRestore} 
            className="hidden" 
            accept=".json"
          />
          <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()} className="justify-start">
            <IconUpload className="mr-3 text-green-400" /> Restore Backup
          </Button>
        </div>
      </div>

      <div className="mt-8">
         <Button variant="danger" fullWidth onClick={onLogout}>Sign Out</Button>
      </div>
      
      <p className="mt-auto pt-8 text-center text-gray-600 text-xs">V254 Inventory App v1.1.0</p>
    </div>
  );
};


// --- Main Application Layout ---

const App = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Scanner Modal State
  const [isScanning, setIsScanning] = useState(false);
  const [scanCallback, setScanCallback] = useState<((code: string) => void) | null>(null);

  // Load Data
  useEffect(() => {
    setProducts(loadState('products', INITIAL_PRODUCTS));
    setMovements(loadState('movements', INITIAL_MOVEMENTS));
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (products.length > 0) saveState('products', products);
  }, [products]);

  useEffect(() => {
    if (movements.length > 0) saveState('movements', movements);
  }, [movements]);

  // --- Logic ---

  const handleStockMove = (qty: number, type: MovementType, reason: string) => {
    if (!selectedProduct || !user) return;

    const newStock = type === MovementType.IN 
      ? selectedProduct.stock + qty 
      : Math.max(0, selectedProduct.stock - qty);

    const updatedProduct = { ...selectedProduct, stock: newStock };
    
    // Update List
    const updatedList = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updatedList);
    setSelectedProduct(updatedProduct);

    // Log Movement
    const move: StockMovement = {
      id: Date.now().toString(),
      productId: updatedProduct.id,
      productName: updatedProduct.name,
      type,
      quantity: qty,
      balanceAfter: newStock,
      userId: user.id,
      reason,
      timestamp: Date.now()
    };
    setMovements(prev => [move, ...prev]);
  };

  const handleGlobalScan = (code: string) => {
    if (scanCallback) {
      scanCallback(code);
      setScanCallback(null);
      setIsScanning(false);
    } else {
      // General Lookup
      const product = products.find(p => p.barcode === code);
      if (product) {
        setSelectedProduct(product);
        setIsScanning(false);
      } else {
        alert(`Product with barcode ${code} not found.`);
      }
    }
  };

  const initiateScan = (callback?: (code: string) => void) => {
    if (callback) {
      setScanCallback(() => callback);
    } else {
      setScanCallback(null);
    }
    setIsScanning(true);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    setCurrentView('inventory');
  };

  // --- Backup / Export Logic ---
  
  const exportCSV = () => {
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Stock', 'Cost', 'Price', 'Supplier', 'Barcode'];
    const rows = products.map(p => 
      [p.id, p.sku, p.name, p.category, p.stock, p.costPrice, p.sellPrice, p.supplier, p.barcode].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const backupData = () => {
    const data = { products, movements, users: INITIAL_USERS };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_v254_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const restoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) setProducts(data.products);
        if (data.movements) setMovements(data.movements);
        alert('Data restored successfully!');
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  // --- Derived Stats ---
  
  const stats: DashboardStats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    return {
      totalProducts: products.reduce((sum, p) => sum + p.stock, 0),
      lowStockCount: products.filter(p => p.stock <= p.lowStockThreshold).length,
      expiredCount: products.filter(p => p.expiryDate && p.expiryDate < Date.now()).length,
      totalValue: products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0),
      movementsToday: movements.filter(m => m.timestamp >= today).length
    };
  }, [products, movements]);

  const bestSellers = useMemo(() => {
    const salesMap: Record<string, number> = {};
    movements.filter(m => m.type === MovementType.OUT).forEach(m => {
      salesMap[m.productName] = (salesMap[m.productName] || 0) + m.quantity;
    });
    return Object.entries(salesMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 3);
  }, [movements]);

  // --- Render ---

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  // If a product is selected, overlay it
  if (selectedProduct) {
    return (
      <ProductDetailView 
        product={selectedProduct} 
        onBack={() => setSelectedProduct(null)}
        onMove={handleStockMove}
      />
    );
  }

  // If adding a product
  if (currentView === 'add-product') {
    return (
      <>
        <AddProductView 
          onSave={handleAddProduct}
          onCancel={() => setCurrentView('dashboard')}
          onRequestScan={initiateScan}
        />
        {isScanning && <ScannerModal onScan={handleGlobalScan} onClose={() => setIsScanning(false)} />}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-brand-dark max-w-md mx-auto relative overflow-hidden shadow-2xl">
      {/* Scanner Overlay */}
      {isScanning && (
        <ScannerModal onScan={handleGlobalScan} onClose={() => setIsScanning(false)} />
      )}

      {/* View Router */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {currentView === 'dashboard' && <DashboardView stats={stats} bestSellers={bestSellers} onNavigate={setCurrentView} />}
        {currentView === 'inventory' && <InventoryView products={products} onSelect={setSelectedProduct} initialFilter={new URLSearchParams(window.location.search).get('filter') || undefined} />}
        {currentView === 'history' && (
           <div className="p-4 pb-24">
             <h2 className="text-xl font-bold mb-4">History</h2>
             <div className="space-y-3">
               {movements.map(m => (
                 <div key={m.id} className="flex justify-between items-center bg-brand-surface p-3 rounded-xl border border-gray-800">
                   <div>
                     <p className="font-semibold text-white">{m.productName}</p>
                     <p className="text-xs text-gray-400">{new Date(m.timestamp).toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                     <span className={`font-bold ${m.type === MovementType.IN ? 'text-green-400' : 'text-brand-accent'}`}>
                       {m.type === MovementType.IN ? '+' : '-'}{m.quantity}
                     </span>
                     <p className="text-xs text-gray-500">{m.reason}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
        {currentView === 'settings' && (
          <SettingsView 
            user={user} 
            onLogout={() => setUser(null)}
            onBackup={backupData}
            onExport={exportCSV}
            onRestore={restoreData}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-brand-dark/95 backdrop-blur border-t border-gray-800 fixed bottom-0 w-full max-w-md flex justify-around items-center px-2 z-50">
        {[
          { id: 'dashboard', icon: <IconHome />, label: 'Home' },
          { id: 'inventory', icon: <IconBox />, label: 'Items' },
          { id: 'scan', icon: <div className="bg-brand-accent p-3 rounded-full -mt-8 shadow-lg shadow-brand-accent/30 text-white"><IconScan /></div>, label: '', custom: true },
          { id: 'history', icon: <IconHistory />, label: 'Logs' },
          { id: 'settings', icon: <IconSettings />, label: 'Menu' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'scan') initiateScan();
              else setCurrentView(item.id);
            }}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              !item.custom && currentView === item.id ? 'text-brand-accent' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {item.icon}
            {item.label && <span className="text-[10px] mt-1 font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;