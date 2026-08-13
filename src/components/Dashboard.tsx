import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface DashboardProps {
  onOpenQuickMovement: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickMovement }) => {
  const {
    products,
    movements,
    stockAlerts,
    totalProductsCount,
    totalInventoryCost,
    totalInventoryRetailValue,
    setActiveTab,
    categoriesList,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');

  // Top products category count
  const categoryStats = categoriesList.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat && p.status === 'activo');
    const totalUnits = catProducts.reduce((sum, p) => sum + p.stock, 0);
    return {
      category: cat,
      count: catProducts.length,
      units: totalUnits,
    };
  });

  const recentMovements = movements.slice(0, 5);

  const filteredQuickProducts = searchTerm.trim()
    ? products.filter(
        (p) =>
          p.status === 'activo' &&
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Ferretería Medrano
              </span>
              <span className="text-slate-400 text-xs">Sistema FerreStock</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Control e Inventario Centralizado
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Supervisión en tiempo real de las existencias, alertas automáticas de reabastecimiento e historial completo de entradas y salidas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuickMovement}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Movimiento</span>
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Consulta Mostrador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Búsqueda rápida por nombre de producto, código (ej. FER-1001) o categoría..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        {searchTerm.trim() && (
          <div className="mt-3 divide-y divide-slate-800 border-t border-slate-800 pt-2">
            {filteredQuickProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No se encontraron productos coincidentes.</p>
            ) : (
              filteredQuickProducts.map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono text-amber-400 text-xs font-bold mr-2">{p.code}</span>
                    <span className="font-medium text-slate-200">{p.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({p.category})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-xs">Ubicación: <strong className="text-slate-300">{p.location}</strong></span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        p.stock <= p.minStock
                          ? p.stock === 0
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Catálogo de Productos
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white">{totalProductsCount}</p>
            <p className="text-xs text-slate-400 mt-1">Artículos activos en sistema</p>
          </div>
        </div>

        {/* Card 2: Stock Alerts */}
        <div
          onClick={() => setActiveTab('alerts')}
          className={`bg-slate-900 border rounded-xl p-5 shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
            stockAlerts.length > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Alertas de Stock Mínimo
            </span>
            <div
              className={`p-2 rounded-lg ${
                stockAlerts.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold text-amber-400">{stockAlerts.length}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stockAlerts.length === 0 ? 'Sin déficit de inventario' : 'Requieren reabastecimiento'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 opacity-80" />
          </div>
        </div>

        {/* Card 3: Valor Inventario Costo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Valor Inventario (Costo)
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white">
              ${totalInventoryCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Costo total acumulado en bodega</p>
          </div>
        </div>

        {/* Card 4: Valor Inventario Venta */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Proyección Venta Total
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-400">
              ${totalInventoryRetailValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-1">Margen estimado: +{totalInventoryCost > 0 ? (((totalInventoryRetailValue - totalInventoryCost) / totalInventoryCost) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Main Section: Alerts + Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Alert Focus Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Productos en Nivel Crítico o Bajo Stock</h2>
              </div>
              <button
                onClick={() => setActiveTab('alerts')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Ver Módulo Alertas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {stockAlerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="font-semibold text-slate-200">¡Inventario en excelente nivel!</p>
                <p className="text-xs mt-1">Todos los productos se encuentran por encima del stock mínimo configurado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Producto</th>
                      <th className="py-2.5 px-3 text-center">Disponible</th>
                      <th className="py-2.5 px-3 text-center">Mínimo</th>
                      <th className="py-2.5 px-3 text-center">Déficit</th>
                      <th className="py-2.5 px-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stockAlerts.slice(0, 6).map(({ product, deficit, severity }) => (
                      <tr key={product.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{product.code}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-100">{product.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={product.stock === 0 ? 'text-red-400' : 'text-amber-400'}>
                            {product.stock} {product.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400">{product.minStock} {product.unit}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-red-400">
                          +{deficit} {product.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              severity === 'critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {severity === 'critical' ? 'Agotado (0)' : 'Stock Bajo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Se muestran los productos con mayor prioridad de surtido</span>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-amber-400 font-semibold hover:underline"
            >
              Gestionar reabastecimiento →
            </button>
          </div>
        </div>

        {/* Right 1 Col: Recent Movements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Últimos Movimientos</span>
            </h2>
            <button
              onClick={() => setActiveTab('movements')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Ver todo
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {recentMovements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No hay movimientos registrados recientemente.</p>
            ) : (
              recentMovements.map((m) => (
                <div key={m.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-200 truncate max-w-[160px]">{m.productName}</span>
                    <span
                      className={`flex items-center gap-1 font-bold ${
                        m.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {m.type === 'entrada' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{m.reason}</span>
                    <span>{new Date(m.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Reg: {m.userName}</span>
                    <span className="font-mono text-slate-400">Ref: {m.referenceDoc}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown summary cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Resumen de Productos por Categoría</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryStats.map((c) => (
            <div key={c.category} className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
              <p className="text-xs font-semibold text-slate-300 truncate" title={c.category}>
                {c.category}
              </p>
              <p className="text-lg font-extrabold text-amber-400 mt-1">{c.count}</p>
              <p className="text-[10px] text-slate-400">{c.units} unid.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
