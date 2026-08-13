export type CategoryType =
  | 'Herramientas Manuales'
  | 'Herramientas Eléctricas'
  | 'Plomería y Tuberías'
  | 'Electricidad'
  | 'Pinturas y Solventes'
  | 'Construcción y Fijaciones'
  | 'Cerrajería y Cintas'
  | 'Seguridad Industrial';

export type MovementType = 'entrada' | 'salida';

export type MovementReason =
  | 'Compra a Proveedor'
  | 'Reabastecimiento'
  | 'Ajuste de Inventario (+)'
  | 'Venta al Contado'
  | 'Merma o Producto Dañado'
  | 'Uso Interno / Consumo'
  | 'Ajuste de Inventario (-)';

export type UnitType = 'Pieza' | 'Caja' | 'Metro' | 'Litro' | 'Kg' | 'Par' | 'Juego' | 'Rollo';

export interface Product {
  id: string;
  code: string; // e.g. FER-1001
  name: string;
  description: string;
  category: CategoryType;
  unit: UnitType;
  price: number; // Precio Venta
  cost: number; // Costo Adquisición
  stock: number; // Cantidad actual disponible
  minStock: number; // Alerta de stock mínimo
  location: string; // e.g., "Pasillo A - Estante 2"
  status: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceDoc?: string; // No. Factura, Guía de Remisión o Nota
  userName: string;
  userRole: UserRole;
  date: string;
  notes?: string;
}

export type UserRole = 'admin' | 'encargado' | 'vendedor';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  avatarColor: string;
  permissions: {
    canManageProducts: boolean;
    canDeleteProducts: boolean;
    canRegisterEntries: boolean;
    canRegisterExits: boolean;
    canViewReports: boolean;
    canChangeMinStock: boolean;
  };
}

export interface StockAlert {
  product: Product;
  deficit: number;
  severity: 'critical' | 'warning'; // critical if stock == 0, warning if stock <= minStock
}

export type ActiveTab = 'dashboard' | 'products' | 'movements' | 'lookup' | 'alerts' | 'reports';
