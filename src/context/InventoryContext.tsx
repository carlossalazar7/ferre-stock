import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  StockMovement,
  UserProfile,
  CategoryType,
  UnitType,
  StockAlert,
  ActiveTab,
  MovementType,
  MovementReason,
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS, INITIAL_USERS } from '../data/initialData';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface InventoryContextType {
  products: Product[];
  movements: StockMovement[];
  users: UserProfile[];
  currentUser: UserProfile | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  switchUser: (userId: string) => void;
  login: (usernameOrEmail: string, pin: string) => { success: boolean; error?: string };
  logout: () => void;
  showScopeModal: boolean;
  setShowScopeModal: (show: boolean) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string };
  updateProduct: (id: string, product: Partial<Product>) => { success: boolean; error?: string };
  toggleProductStatus: (id: string) => void;
  deleteProduct: (id: string) => { success: boolean; error?: string };

  // Movement actions
  registerMovement: (data: {
    productId: string;
    type: MovementType;
    reason: MovementReason;
    quantity: number;
    referenceDoc?: string;
    notes?: string;
  }) => { success: boolean; error?: string };

  // Derived state
  stockAlerts: StockAlert[];
  criticalAlertsCount: number;
  totalProductsCount: number;
  totalInventoryCost: number;
  totalInventoryRetailValue: number;
  categoriesList: CategoryType[];
  unitsList: UnitType[];

  // Toast notifications
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetToDemoData: () => void;
}

const CATEGORIES_LIST: CategoryType[] = [
  'Herramientas Manuales',
  'Herramientas Eléctricas',
  'Plomería y Tuberías',
  'Electricidad',
  'Pinturas y Solventes',
  'Construcción y Fijaciones',
  'Cerrajería y Cintas',
  'Seguridad Industrial',
];

const UNITS_LIST: UnitType[] = [
  'Pieza',
  'Caja',
  'Metro',
  'Litro',
  'Kg',
  'Par',
  'Juego',
  'Rollo',
];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ferrestock_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('ferrestock_movements');
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('ferrestock_current_user');
      if (savedUser && savedUser !== 'null') {
        const parsed = JSON.parse(savedUser);
        const found = INITIAL_USERS.find((u) => u.id === parsed.id);
        if (found) return found;
      }
      return INITIAL_USERS[0]; // Default initial login as admin for quick demo
    } catch {
      return INITIAL_USERS[0];
    }
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showScopeModal, setShowScopeModal] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ferrestock_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ferrestock_movements', JSON.stringify(movements));
    } catch (e) {
      console.error('Failed to save movements to localStorage', e);
    }
  }, [movements]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('ferrestock_current_user', JSON.stringify(found));
      showToast(`Usuario activo cambiado a: ${found.name} (${found.roleTitle})`, 'info');
    }
  };

  const login = (usernameOrEmail: string, pin: string) => {
    const query = usernameOrEmail.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === query || u.email.toLowerCase() === query) &&
        u.pin === pin.trim()
    );

    if (found) {
      setCurrentUser(found);
      localStorage.setItem('ferrestock_current_user', JSON.stringify(found));
      showToast(`¡Bienvenido/a ${found.name}! Sesión iniciada como ${found.roleTitle}`, 'success');
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Usuario, correo o PIN incorrectos. Seleccione un usuario de la lista de demostración.',
      };
    }
  };

  const logout = () => {
    const prevName = currentUser?.name;
    setCurrentUser(null);
    localStorage.removeItem('ferrestock_current_user');
    showToast(`Sesión cerrada para ${prevName || 'el usuario'}.`, 'info');
  };

  const resetToDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setMovements(INITIAL_MOVEMENTS);
    localStorage.removeItem('ferrestock_products');
    localStorage.removeItem('ferrestock_movements');
    showToast('Se restablecieron los datos de ejemplo de Ferretería Medrano', 'success');
  };

  // Add Product
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser?.permissions.canManageProducts) {
      return { success: false, error: 'Su rol no tiene permisos para registrar productos.' };
    }

    // Check duplicate code
    const codeExists = products.some(
      (p) => p.code.trim().toLowerCase() === data.code.trim().toLowerCase()
    );
    if (codeExists) {
      return { success: false, error: `El código "${data.code}" ya se encuentra registrado.` };
    }

    const newProd: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProd, ...prev]);

    // If initial stock > 0, auto-register an entry movement
    if (data.stock > 0) {
      const initialMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: newProd.id,
        productCode: newProd.code,
        productName: newProd.name,
        type: 'entrada',
        reason: 'Ajuste de Inventario (+)',
        quantity: data.stock,
        previousStock: 0,
        newStock: data.stock,
        referenceDoc: 'Alta Inicial',
        userName: currentUser.name,
        userRole: currentUser.role,
        date: new Date().toISOString(),
        notes: 'Registro inicial de stock al crear producto.',
      };
      setMovements((prev) => [initialMovement, ...prev]);
    }

    showToast(`Producto "${newProd.name}" registrado correctamente.`, 'success');
    return { success: true };
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (!currentUser?.permissions.canManageProducts) {
      return { success: false, error: 'Su rol no tiene permisos para editar productos.' };
    }

    if (updates.minStock !== undefined && !currentUser.permissions.canChangeMinStock) {
      return { success: false, error: 'No tiene permisos para modificar el stock mínimo.' };
    }

    let updatedName = '';
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedName = updates.name || p.name;
          return {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    showToast(`Producto "${updatedName}" actualizado con éxito.`, 'success');
    return { success: true };
  };

  // Toggle status
  const toggleProductStatus = (id: string) => {
    if (!currentUser?.permissions.canManageProducts) {
      showToast('No tiene permisos para cambiar el estado de un producto.', 'error');
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'activo' ? 'inactivo' : 'activo';
          showToast(
            `Producto ${p.code} marcado como ${newStatus.toUpperCase()}`,
            newStatus === 'activo' ? 'success' : 'info'
          );
          return { ...p, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // Delete product
  const deleteProduct = (id: string) => {
    if (!currentUser?.permissions.canDeleteProducts) {
      showToast('Solo el Administrador General puede eliminar productos definitivamente.', 'error');
      return { success: false, error: 'Sin permisos de eliminación.' };
    }

    const target = products.find((p) => p.id === id);
    if (!target) return { success: false, error: 'Producto no encontrado' };

    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Producto "${target.name}" eliminado del catálogo.`, 'info');
    return { success: true };
  };

  // Register Movement
  const registerMovement = (data: {
    productId: string;
    type: MovementType;
    reason: MovementReason;
    quantity: number;
    referenceDoc?: string;
    notes?: string;
  }) => {
    if (data.type === 'entrada' && !currentUser.permissions.canRegisterEntries) {
      return { success: false, error: 'Su rol no tiene permisos para registrar entradas de mercadería.' };
    }
    if (data.type === 'salida' && !currentUser.permissions.canRegisterExits) {
      return { success: false, error: 'Su rol no tiene permisos para registrar salidas de mercadería.' };
    }

    if (data.quantity <= 0) {
      return { success: false, error: 'La cantidad debe ser un número mayor a cero.' };
    }

    const target = products.find((p) => p.id === data.productId);
    if (!target) {
      return { success: false, error: 'El producto seleccionado no existe.' };
    }

    if (target.status === 'inactivo') {
      return { success: false, error: 'No se pueden realizar movimientos en productos inactivos.' };
    }

    const prevStock = target.stock;
    let newStock = prevStock;

    if (data.type === 'entrada') {
      newStock = prevStock + data.quantity;
    } else {
      // Salida
      if (data.quantity > prevStock) {
        return {
          success: false,
          error: `Stock insuficiente. Disponible: ${prevStock} ${target.unit}, intentando retirar: ${data.quantity} ${target.unit}.`,
        };
      }
      newStock = prevStock - data.quantity;
    }

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? { ...p, stock: newStock, updatedAt: new Date().toISOString() }
          : p
      )
    );

    // Create movement record
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: target.id,
      productCode: target.code,
      productName: target.name,
      type: data.type,
      reason: data.reason,
      quantity: data.quantity,
      previousStock: prevStock,
      newStock,
      referenceDoc: data.referenceDoc?.trim() || (data.type === 'entrada' ? 'REABASTECIMIENTO' : 'VENTA'),
      userName: currentUser.name,
      userRole: currentUser.role,
      date: new Date().toISOString(),
      notes: data.notes?.trim() || '',
    };

    setMovements((prev) => [newMovement, ...prev]);

    showToast(
      `Movimiento registrado: ${data.type === 'entrada' ? '+' : '-'}${data.quantity} ${target.unit} en ${target.name}. Stock actual: ${newStock}`,
      'success'
    );

    return { success: true };
  };

  // Stock Alerts computation
  const stockAlerts = useMemo<StockAlert[]>(() => {
    return products
      .filter((p) => p.status === 'activo' && p.stock <= p.minStock)
      .map((p) => ({
        product: p,
        deficit: p.minStock - p.stock,
        severity: p.stock === 0 ? 'critical' : 'warning',
      }))
      .sort((a, b) => {
        // Critical (stock=0) first, then highest deficit
        if (a.severity !== b.severity) {
          return a.severity === 'critical' ? -1 : 1;
        }
        return b.deficit - a.deficit;
      });
  }, [products]);

  const criticalAlertsCount = stockAlerts.filter((a) => a.severity === 'critical').length;
  const totalProductsCount = products.filter((p) => p.status === 'activo').length;

  const totalInventoryCost = useMemo(() => {
    return products
      .filter((p) => p.status === 'activo')
      .reduce((sum, p) => sum + p.stock * p.cost, 0);
  }, [products]);

  const totalInventoryRetailValue = useMemo(() => {
    return products
      .filter((p) => p.status === 'activo')
      .reduce((sum, p) => sum + p.stock * p.price, 0);
  }, [products]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        movements,
        users,
        currentUser,
        activeTab,
        setActiveTab,
        switchUser,
        showScopeModal,
        setShowScopeModal,
        addProduct,
        updateProduct,
        toggleProductStatus,
        deleteProduct,
        registerMovement,
        stockAlerts,
        criticalAlertsCount,
        totalProductsCount,
        totalInventoryCost,
        totalInventoryRetailValue,
        categoriesList: CATEGORIES_LIST,
        unitsList: UNITS_LIST,
        toast,
        showToast,
        resetToDemoData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
