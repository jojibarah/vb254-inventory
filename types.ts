export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  category: string;
  supplier: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  lowStockThreshold: number;
  expiryDate: number | null; // Timestamp or null if not applicable
  imagePath?: string;
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST'
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  balanceAfter: number;
  userId: string;
  reason: string;
  timestamp: number;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  expiredCount: number;
  totalValue: number;
  movementsToday: number;
}