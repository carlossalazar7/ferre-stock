import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface StockAlertsProps {
  onOpenQuickMovementWithProduct?: (productId: string) => void;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ onOpenQuickMovementWithProduct }) => {
  const { stockAlerts, criticalAlertsCount, totalProductsCount, updateProduct, currentUser } = useInventory();

  const [editingMinStockId, setEditingMinStockId] = useState<string | null>(null);
  const [newMinStockVal, setNewMinStockVal] = useState<number>(5);

  const handleSaveMinStock = (productId: string) => {
    updateProduct(productId, { minStock: newMinStockVal });
    setEditingMinStockId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Alertas de Stock Mínimo y Reabastecimiento</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detección oportuna de productos con existencias iguales o inferiores al nivel mínimo establecido para prevenir desabasto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
            {stockAlerts.length} productos en alerta
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-red-400">{criticalAlertsCount}</p>
            <p className="text-xs text-slate-400">Productos Agotados (Stock 0)</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-400">{stockAlerts.length - criticalAlertsCount}</p>
            <p className="text-xs text-slate-400">Productos en Bajo Stock (&le; Mínimo)</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-400">
              {totalProductsCount - stockAlerts.length}
            </p>
            <p className="text-xs text-slate-400">Productos en Nivel Óptimo</p>
          </div>
        </div>
      </div>

      {/* Main Alert Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-amber-400" />
            <span>Listado Prioritario para Orden de Reposición</span>
          </h2>
          <span className="text-xs text-slate-400">Ordenado por nivel crítico y mayor déficit</span>
        </div>

        {stockAlerts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-base font-bold text-slate-100">¡No hay alertas pendientes!</p>
            <p className="text-xs mt-1 text-slate-400">
              Todos los productos registrados cuentan con existencias superiores a su límite mínimo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Severidad</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4 text-center">Disponible</th>
                  <th className="py-3 px-4 text-center">Stock Mínimo</th>
                  <th className="py-3 px-4 text-center">Faltante para Mínimo</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockAlerts.map(({ product, deficit, severity }) => (
                  <tr key={product.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {severity === 'critical' ? 'Agotado (0)' : 'Alerta Mínimo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{product.code}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-100">{product.name}</p>
                      <p className="text-[10px] text-slate-400">{product.category}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{product.location}</td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={product.stock === 0 ? 'text-red-400 font-mono' : 'text-amber-400 font-mono'}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingMinStockId === product.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={newMinStockVal}
                            onChange={(e) => setNewMinStockVal(parseInt(e.target.value) || 1)}
                            className="w-14 px-1 py-0.5 bg-slate-950 border border-amber-500 text-xs font-mono text-slate-100 rounded text-center"
                          />
                          <button
                            onClick={() => handleSaveMinStock(product.id)}
                            className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-bold"
                          >
                            Ok
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-slate-300">{product.minStock} {product.unit}</span>
                          {currentUser.permissions.canChangeMinStock && (
                            <button
                              onClick={() => {
                                setEditingMinStockId(product.id);
                                setNewMinStockVal(product.minStock);
                              }}
                              className="text-[10px] text-amber-400 underline hover:text-amber-300 ml-1"
                              title="Ajustar límite de alerta"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-red-400">
                      +{deficit} {product.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onOpenQuickMovementWithProduct && (
                        <button
                          onClick={() => onOpenQuickMovementWithProduct(product.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm transition-all active:scale-95"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Reabastecer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
