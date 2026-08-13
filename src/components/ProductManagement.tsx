import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Power,
  AlertTriangle,
  X,
  Check,
  Tag,
  MapPin,
  DollarSign,
  Boxes,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, CategoryType, UnitType } from '../types';

export const ProductManagement: React.FC = () => {
  const {
    products,
    categoriesList,
    unitsList,
    addProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
    currentUser,
  } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: categoriesList[0] as CategoryType,
    unit: unitsList[0] as UnitType,
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 5,
    location: '',
    status: 'activo' as 'activo' | 'inactivo',
  });

  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormData({
      code: `FER-${1000 + products.length + 1}`,
      name: '',
      description: '',
      category: categoriesList[0],
      unit: unitsList[0],
      cost: 0,
      price: 0,
      stock: 0,
      minStock: 5,
      location: 'Pasillo A - Estante 1',
      status: 'activo',
    });
    setEditingProduct(null);
    setFormError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      description: p.description,
      category: p.category,
      unit: p.unit,
      cost: p.cost,
      price: p.price,
      stock: p.stock,
      minStock: p.minStock,
      location: p.location,
      status: p.status,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('El código del producto es obligatorio.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }
    if (formData.price < 0 || formData.cost < 0) {
      setFormError('Los precios no pueden ser negativos.');
      return;
    }

    if (editingProduct) {
      // Update
      const res = updateProduct(editingProduct.id, formData);
      if (res.success) {
        setIsFormOpen(false);
      } else {
        setFormError(res.error || 'Error al actualizar');
      }
    } else {
      // Add
      const res = addProduct(formData);
      if (res.success) {
        setIsFormOpen(false);
      } else {
        setFormError(res.error || 'Error al crear');
      }
    }
  };

  // Filtered product list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Module Title + Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Gestión de Productos</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administración completa del catálogo de la ferretería: altas, cambios de datos, precios y stock mínimo.
          </p>
        </div>

        {currentUser.permissions.canManageProducts && (
          <button
            onClick={handleOpenAdd}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md text-sm flex items-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Registrar Producto</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre o ubicación..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todas las categorías</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Solo Activos</option>
            <option value="inactivo">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Ubicación</th>
                <th className="py-3 px-4 text-right">Costo</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-center">Stock Disp.</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    No se encontraron productos registrados con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const isZero = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        p.status === 'inactivo' ? 'opacity-50 bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.code}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-100">{p.name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {p.location || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        ${p.cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <div className="flex flex-col items-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              isZero
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">Mín: {p.minStock}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === 'activo'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detail View */}
                          <button
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          {currentUser.permissions.canManageProducts && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                              title="Editar datos del producto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Toggle Status */}
                          {currentUser.permissions.canManageProducts && (
                            <button
                              onClick={() => toggleProductStatus(p.id)}
                              className={`p-1.5 rounded transition-colors ${
                                p.status === 'activo'
                                  ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                                  : 'text-emerald-400 hover:bg-slate-800'
                              }`}
                              title={p.status === 'activo' ? 'Desactivar producto' : 'Reactivar producto'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {currentUser.permissions.canDeleteProducts && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Confirma eliminar el producto "${p.name}" (${p.code})?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Mostrando {filteredProducts.length} de {products.length} productos</span>
          <span className="text-[11px] font-mono text-slate-500">Módulo de Gestión de Productos - In Scope</span>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>{editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}</span>
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Código de Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ej. FER-1020"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Martillo de Bola 12oz"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción Corta
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Especificaciones o detalles del artículo..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unidad de Medida *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {unitsList.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cost */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Costo Adquisición ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Precio Venta ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Stock Mínimo (Alerta) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stock Initial (Only for new) */}
                {!editingProduct && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Stock Inicial Disponible
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {/* Location */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ubicación en Bodega/Tienda</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej. Pasillo A - Estante 2"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Product Detail Drawer / Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-amber-400 font-bold">{viewingProduct.code}</span>
                <h2 className="text-lg font-bold text-white">{viewingProduct.name}</h2>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {viewingProduct.description || 'Sin descripción guardada.'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Categoría</span>
                  <span className="font-semibold text-slate-200">{viewingProduct.category}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Ubicación en Ferretería</span>
                  <span className="font-semibold text-slate-200">{viewingProduct.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Costo Unit.</span>
                  <span className="font-mono font-bold text-slate-200">${viewingProduct.cost.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Precio Venta</span>
                  <span className="font-mono font-bold text-amber-400">${viewingProduct.price.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Stock Actual</span>
                  <span
                    className={`font-mono font-bold ${
                      viewingProduct.stock <= viewingProduct.minStock ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {viewingProduct.stock} {viewingProduct.unit}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-slate-400">
                <span>Nivel Stock Mínimo: <strong className="text-slate-200">{viewingProduct.minStock} {viewingProduct.unit}</strong></span>
                <span>Estado: <strong className="text-emerald-400 uppercase">{viewingProduct.status}</strong></span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
