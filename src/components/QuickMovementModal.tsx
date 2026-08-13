import React, { useState, useEffect } from 'react';
import { X, ArrowDownUp, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { MovementType, MovementReason } from '../types';

interface QuickMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const QuickMovementModal: React.FC<QuickMovementModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { products, registerMovement } = useInventory();

  const [productId, setProductId] = useState<string>('');
  const [type, setType] = useState<MovementType>('entrada');
  const [reason, setReason] = useState<MovementReason>('Compra a Proveedor');
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceDoc, setReferenceDoc] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [preselectedProductId, products]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === productId);

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    if (newType === 'entrada') {
      setReason('Compra a Proveedor');
    } else {
      setReason('Venta al Contado');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Por favor seleccione un producto.');
      return;
    }

    const res = registerMovement({
      productId,
      type,
      reason,
      quantity,
      referenceDoc,
      notes,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Error al procesar el movimiento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Registrar Movimiento de Inventario</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Movement Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo *</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('entrada')}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'entrada' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Entrada (+)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('salida')}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'salida' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Salida (-)</span>
              </button>
            </div>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Producto *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {products
                .filter((p) => p.status === 'activo')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} (Disp: {p.stock} {p.unit})
                  </option>
                ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center text-slate-300">
              <span>Ubicación: <strong className="text-slate-100">{selectedProduct.location}</strong></span>
              <span>Precio Venta: <strong className="text-amber-400 font-mono">${selectedProduct.price.toFixed(2)}</strong></span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {type === 'entrada' ? (
                <>
                  <option value="Compra a Proveedor">Compra a Proveedor</option>
                  <option value="Reabastecimiento">Reabastecimiento</option>
                  <option value="Ajuste de Inventario (+)">Ajuste de Inventario (+)</option>
                </>
              ) : (
                <>
                  <option value="Venta al Contado">Venta al Contado</option>
                  <option value="Merma o Producto Dañado">Merma o Producto Dañado</option>
                  <option value="Uso Interno / Consumo">Uso Interno / Consumo</option>
                  <option value="Ajuste de Inventario (-)">Ajuste de Inventario (-)</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Doc Ref */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">No. Factura / Ticket</label>
              <input
                type="text"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="Ej. FAC-1002"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-slate-950 transition-all ${
                type === 'entrada' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              Guardar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
