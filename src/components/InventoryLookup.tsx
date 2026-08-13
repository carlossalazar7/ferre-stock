import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Tag,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface InventoryLookupProps {
  onOpenQuickMovementWithProduct?: (productId: string) => void;
}

export const InventoryLookup: React.FC<InventoryLookupProps> = ({ onOpenQuickMovementWithProduct }) => {
  const { products, categoriesList } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const filtered = products.filter((p) => {
    if (p.status !== 'activo') return false;

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesLow = !onlyLowStock || p.stock <= p.minStock;

    return matchesSearch && matchesCategory && matchesLow;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Consulta Rápida de Inventario</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Herramienta ágil de atención en mostrador para consultar existencias, ubicaciones en pasillos y precios al público.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Consultas en tiempo real sincronizadas</span>
        </div>
      </div>

      {/* Speed Search Controls */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escriba código (ej. FER-1001), nombre de herramienta o ubicación..."
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-base font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              >
                <option value="all">Todas ({categoriesList.length})</option>
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Ver solo stock bajo / agotados</span>
            </label>
          </div>

          <span className="text-slate-400 font-medium">
            Resultados: <strong className="text-amber-400">{filtered.length}</strong> artículos
          </span>
        </div>
      </div>

      {/* Grid of Product Cards for Counter Query */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-200">No se encontraron artículos en la búsqueda.</p>
            <p className="text-xs mt-1">Pruebe limpiando el filtro de categoría o cambiando el término.</p>
          </div>
        ) : (
          filtered.map((p) => {
            const isLow = p.stock <= p.minStock;
            const isZero = p.stock === 0;

            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line: Code & Stock pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                      {p.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isZero
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : isLow
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {p.stock} {p.unit}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-white leading-snug">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        Categoría:
                      </span>
                      <span className="font-medium">{p.category}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        Ubicación:
                      </span>
                      <span className="font-semibold text-slate-100">{p.location || 'Por asignar'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Precio Público</span>
                    <span className="text-xl font-black font-mono text-amber-400">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>

                  {onOpenQuickMovementWithProduct && (
                    <button
                      onClick={() => onOpenQuickMovementWithProduct(p.id)}
                      disabled={isZero}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isZero
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isZero ? 'Agotado' : 'Registrar Venta'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
