import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownUp,
  Search,
  AlertTriangle,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stockAlerts, currentUser } = useInventory();

  const navItems: {
    id: ActiveTab;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      description: 'Resumen e indicadores clave',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'products',
      label: 'Catálogo de Productos',
      description: 'Alta, modificación y estados',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'movements',
      label: 'Entradas y Salidas',
      description: 'Registro de flujo de mercadería',
      icon: <ArrowDownUp className="w-5 h-5" />,
    },
    {
      id: 'lookup',
      label: 'Consulta de Inventario',
      description: 'Búsqueda veloz para mostrador',
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      label: 'Alertas de Stock Mínimo',
      description: 'Productos por reabastecer',
      icon: <AlertTriangle className="w-5 h-5" />,
      badge: stockAlerts.length,
      badgeColor: stockAlerts.length > 0 ? 'bg-amber-500 text-slate-950' : undefined,
    },
    {
      id: 'reports',
      label: 'Reportes y Estadísticas',
      description: 'Informes detallados del estado',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-2">
          Módulos FerreStock
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>{item.icon}</span>
                  <div className="text-left">
                    <p className="leading-tight">{item.label}</p>
                    <p
                      className={`text-[10px] ${
                        isActive ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User permissions badge box */}
        <div className="mt-8 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Permisos Activos</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {currentUser.role === 'admin' && 'Acceso total de lectura, escritura, mermas y eliminación.'}
            {currentUser.role === 'encargado' && 'Gestión de productos, entradas, salidas y reportes.'}
            {currentUser.role === 'vendedor' && 'Consulta de inventario y registro de salidas por ventas.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
