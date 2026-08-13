import React, { useState } from 'react';
import {
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Filter,
  Search,
  Calendar,
  FileText,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { MovementType, MovementReason } from '../types';

export const MovementsManager: React.FC = () => {
  const {
    products,
    movements,
    registerMovement,
    currentUser,
  } = useInventory();

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('entrada');
  const [movementReason, setMovementReason] = useState<MovementReason>('Compra a Proveedor');
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceDoc, setReferenceDoc] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Table filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleTypeChange = (type: MovementType) => {
    setMovementType(type);
    if (type === 'entrada') {
      setMovementReason('Compra a Proveedor');
    } else {
      setMovementReason('Venta al Contado');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProductId) {
      setFormError('Seleccione un producto del catálogo.');
      return;
    }

    const res = registerMovement({
      productId: selectedProductId,
      type: movementType,
      reason: movementReason,
      quantity,
      referenceDoc,
      notes,
    });

    if (!res.success) {
      setFormError(res.error || 'Error al procesar el movimiento.');
    } else {
      // Reset form fields
      setQuantity(1);
      setReferenceDoc('');
      setNotes('');
      setFormError('');
    }
  };

  // Filtered movements log
  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceDoc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || m.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Control de Entradas y Salidas</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Módulo para registrar compras, ventas, mermas o ajustes de stock y consultar el historial completo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Movement Registration Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm h-fit">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <span>Registrar Movimiento de Stock</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Afecta automáticamente las existencias del catálogo</p>
          </div>

          {formError && (
            <div className="mt-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Movement Type Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tipo de Movimiento *
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleTypeChange('entrada')}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    movementType === 'entrada'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Entrada (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('salida')}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    movementType === 'salida'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Salida (-)</span>
                </button>
              </div>
            </div>

            {/* Product Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seleccionar Producto *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {products
                  .filter((p) => p.status === 'activo')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} (Stock: {p.stock} {p.unit})
                    </option>
                  ))}
              </select>
            </div>

            {/* Stock status callout for selected product */}
            {selectedProduct && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block">Stock Actual:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {selectedProduct.stock} {selectedProduct.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Ubicación:</span>
                  <span className="text-slate-200">{selectedProduct.location}</span>
                </div>
              </div>
            )}

            {/* Reason Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motivo del Movimiento *
              </label>
              <select
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value as MovementReason)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {movementType === 'entrada' ? (
                  <>
                    <option value="Compra a Proveedor">Compra a Proveedor</option>
                    <option value="Reabastecimiento">Reabastecimiento de Almacén</option>
                    <option value="Ajuste de Inventario (+)">Ajuste de Inventario (+)</option>
                  </>
                ) : (
                  <>
                    <option value="Venta al Contado">Venta al Contado (Mostrador)</option>
                    <option value="Merma o Producto Dañado">Merma o Producto Dañado</option>
                    <option value="Uso Interno / Consumo">Uso Interno / Consumo Ferretería</option>
                    <option value="Ajuste de Inventario (-)">Ajuste de Inventario (-)</option>
                  </>
                )}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cantidad de Unidades *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Reference Doc */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Documento / Ref (Factura, Ticket, Remisión)
              </label>
              <input
                type="text"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="Ej. FAC-9912 o TKT-0102"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Comentarios adicionales..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                movementType === 'entrada'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              Confirmar y Registrar {movementType === 'entrada' ? 'Entrada' : 'Salida'}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Movements History Log Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Historial de Movimientos Registrados</span>
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="all">Todos los movimientos</option>
                <option value="entrada">Solo Entradas</option>
                <option value="salida">Solo Salidas</option>
              </select>
            </div>
          </div>

          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por producto, ref, usuario..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-center">Stock Antes/Después</th>
                  <th className="py-2.5 px-3">Ref / Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                      No hay registros de movimientos que coincidan.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {new Date(m.date).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.type === 'entrada'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {m.type === 'entrada' ? '+' : '-'}{m.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-200">{m.productName}</p>
                        <p className="text-[10px] font-mono text-amber-400">{m.productCode} • {m.reason}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono">
                        <span className={m.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}>
                          {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {m.previousStock} → <strong className="text-slate-100">{m.newStock}</strong>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-mono text-[11px] text-slate-200">{m.referenceDoc || 'Sin ref'}</p>
                        <p className="text-[10px] text-slate-400">{m.userName}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
