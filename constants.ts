import { Product, User, UserRole, StockMovement, MovementType } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@v254.com', role: UserRole.ADMIN },
  { id: 'u2', name: 'Staff Member', email: 'staff@v254.com', role: UserRole.STAFF },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'V254-001',
    name: 'Silicone Bullet Vibrator',
    barcode: '123456789',
    category: 'Vibrators',
    supplier: 'Global Imports Ltd',
    costPrice: 1500,
    sellPrice: 3000,
    stock: 42,
    lowStockThreshold: 10,
    expiryDate: null,
    imagePath: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'p2',
    sku: 'V254-002',
    name: 'Rabbit Dual Stimulator',
    barcode: '987654321',
    category: 'Vibrators',
    supplier: 'AdultToy Co',
    costPrice: 2500,
    sellPrice: 5500,
    stock: 4,
    lowStockThreshold: 5,
    expiryDate: null,
    imagePath: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'p3',
    sku: 'V254-003',
    name: 'Luxury Massage Oil',
    barcode: '456123789',
    category: 'Accessories',
    supplier: 'Local Wellness',
    costPrice: 800,
    sellPrice: 1800,
    stock: 25,
    lowStockThreshold: 10,
    expiryDate: Date.now() + 86400000 * 30, // Expires in 30 days
    imagePath: 'https://picsum.photos/200/200?random=3'
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'm1',
    productId: 'p1',
    productName: 'Silicone Bullet Vibrator',
    type: MovementType.IN,
    quantity: 50,
    balanceAfter: 50,
    userId: 'u1',
    reason: 'Initial Import',
    timestamp: Date.now() - 86400000 // Yesterday
  },
  {
    id: 'm2',
    productId: 'p1',
    productName: 'Silicone Bullet Vibrator',
    type: MovementType.OUT,
    quantity: 8,
    balanceAfter: 42,
    userId: 'u2',
    reason: 'Sale #1024',
    timestamp: Date.now() - 3600000 // 1 hour ago
  }
];