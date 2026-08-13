import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Package,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useInventory } from '../context/InventoryContext';

type ReportType = 'general' | 'low_stock' | 'entries' | 'exits' | 'categories';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const ReportsView: React.FC = () => {
  const {
    products,
    movements,
    stockAlerts,
    totalInventoryCost,
    totalInventoryRetailValue,
    categoriesList,
  } = useInventory();

  const [activeReportTab, setActiveReportTab] = useState<ReportType>('general');

  // Prepare data for category stock distribution chart
  const categoryChartData = categoriesList.map((cat) => {
    const catProds = products.filter((p) => p.category === cat && p.status === 'activo');
    const totalValCost = catProds.reduce((sum, p) => sum + p.stock * p.cost, 0);
    const totalUnits = catProds.reduce((sum, p) => sum + p.stock, 0);
    return {
      name: cat,
      valorCosto: totalValCost,
      unidades: totalUnits,
      cantidadProductos: catProds.length,
    };
  });

  // Prepare data for entries vs exits balance chart
  const entriesCount = movements.filter((m) => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
  const exitsCount = movements.filter((m) => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0);

  const flowData = [
    { name: 'Entradas de Mercadería', unidades: entriesCount, fill: '#10b981' },
    { name: 'Salidas / Ventas', unidades: exitsCount, fill: '#ef4444' },
  ];

  // CSV Export Helper
  const handleExportCSV = () => {
    let headers = '';
    let rows: string[] = [];
    let filename = `Reporte_FerreStock_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeReportTab === 'general') {
      headers = 'Código,Producto,Categoría,Unidad,Costo,Precio,Stock,Ubicación,Estado\n';
      rows = products.map(
        (p) =>
          `"${p.code}","${p.name}","${p.category}","${p.unit}",${p.cost},${p.price},${p.stock},"${p.location}","${p.status}"`
      );
    } else if (activeReportTab === 'low_stock') {
      headers = 'Código,Producto,Categoría,Stock Actual,Stock Mínimo,Faltante,Estado\n';
      rows = stockAlerts.map(
        ({ product, deficit, severity }) =>
          `"${product.code}","${product.name}","${product.category}",${product.stock},${product.minStock},${deficit},"${severity}"`
      );
    } else if (activeReportTab === 'entries' || activeReportTab === 'exits') {
      const type = activeReportTab === 'entries' ? 'entrada' : 'salida';
      const targetMovements = movements.filter((m) => m.type === type);
      headers = 'Fecha,Código,Producto,Motivo,Cantidad,StockPrevio,StockNuevo,Ref,Usuario\n';
      rows = targetMovements.map(
        (m) =>
          `"${m.date}","${m.productCode}","${m.productName}","${m.reason}",${m.quantity},${m.previousStock},${m.newStock},"${m.referenceDoc}","${m.userName}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Title */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Módulo de Reportes de Inventario</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generación de informes ejecutivos sobre el estado del inventario, productos con bajo stock y movimientos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* Report Sub-Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-2 print:hidden">
        <button
          onClick={() => setActiveReportTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'general'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-white'
          }`}
        >
          Reporte General Existencias
        </button>
        <button
          onClick={() => setActiveReportTab('low_stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeReportTab === 'low_stock'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Bajo Stock ({stockAlerts.length})</span>
        </button>
        <button
          onClick={() => setActiveReportTab('entries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'entries'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-white'
          }`}
        >
          Entradas de Mercadería
        </button>
        <button
          onClick={() => setActiveReportTab('exits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'exits'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-white'
          }`}
        >
          Salidas y Ventas
        </button>
        <button
          onClick={() => setActiveReportTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeReportTab === 'categories'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 bg-slate-900 hover:text-white'
          }`}
        >
          Análisis por Categorías
        </button>
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        {/* Chart 1: Category Stock Value */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Valorización de Inventario ($ Costo por Categoría)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Valor Costo']}
                />
                <Bar dataKey="valorCosto" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Flow Balance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Balance Unidades: Entradas vs Salidas</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flowData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="unidades"
                >
                  {flowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} unidades`, 'Total Movido']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Printable Report Data Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm print:bg-white print:text-slate-900 print:border-none">
        <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center print:border-slate-300">
          <div>
            <h2 className="text-lg font-bold text-white print:text-slate-900">
              Ferretería Medrano • Reporte de Inventario FerreStock
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              Tipo: <strong className="text-amber-400 print:text-amber-700 uppercase">{activeReportTab}</strong> | Emisión: {new Date().toLocaleDateString('es-MX')} {new Date().toLocaleTimeString('es-MX')}
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-slate-700 font-mono">
            <p>Valor Costo: ${totalInventoryCost.toFixed(2)}</p>
            <p>Valor Venta: ${totalInventoryRetailValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Tab 1: General Products Report */}
        {activeReportTab === 'general' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-900">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3 text-right">Costo</th>
                  <th className="py-2.5 px-3 text-right">Precio</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-right">Valor Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono font-bold text-amber-400 print:text-slate-900">{p.code}</td>
                    <td className="py-2 px-3 font-semibold text-slate-100 print:text-slate-900">{p.name}</td>
                    <td className="py-2 px-3">{p.category}</td>
                    <td className="py-2 px-3 text-right font-mono">${p.cost.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono">${p.price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-center font-bold font-mono">{p.stock} {p.unit}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">${(p.stock * p.cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Low Stock Report */}
        {activeReportTab === 'low_stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-900">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3 text-center">Stock Actual</th>
                  <th className="py-2.5 px-3 text-center">Stock Mínimo</th>
                  <th className="py-2.5 px-3 text-center">Déficit Reposición</th>
                  <th className="py-2.5 px-3">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {stockAlerts.map(({ product, deficit }) => (
                  <tr key={product.id}>
                    <td className="py-2 px-3 font-mono font-bold text-amber-400 print:text-slate-900">{product.code}</td>
                    <td className="py-2 px-3 font-semibold text-slate-100 print:text-slate-900">{product.name}</td>
                    <td className="py-2 px-3">{product.category}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-red-400 print:text-red-700">
                      {product.stock} {product.unit}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">{product.minStock} {product.unit}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-amber-400 print:text-amber-700">
                      +{deficit} {product.unit}
                    </td>
                    <td className="py-2 px-3">{product.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3 & 4: Entries / Exits Report */}
        {(activeReportTab === 'entries' || activeReportTab === 'exits') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-900">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Motivo</th>
                  <th className="py-2.5 px-3 text-center">Cantidad</th>
                  <th className="py-2.5 px-3">Ref. Doc</th>
                  <th className="py-2.5 px-3">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {movements
                  .filter((m) => m.type === (activeReportTab === 'entries' ? 'entrada' : 'salida'))
                  .map((m) => (
                    <tr key={m.id}>
                      <td className="py-2 px-3 text-slate-400 print:text-slate-700">
                        {new Date(m.date).toLocaleDateString('es-MX')}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-amber-400 print:text-slate-900">{m.productCode}</td>
                      <td className="py-2 px-3 font-semibold text-slate-100 print:text-slate-900">{m.productName}</td>
                      <td className="py-2 px-3">{m.reason}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        {activeReportTab === 'entries' ? '+' : '-'}{m.quantity}
                      </td>
                      <td className="py-2 px-3 font-mono">{m.referenceDoc}</td>
                      <td className="py-2 px-3">{m.userName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Categories summary */}
        {activeReportTab === 'categories' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-900">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3 text-center">Variedad de Productos</th>
                  <th className="py-2.5 px-3 text-center">Unidades Totales</th>
                  <th className="py-2.5 px-3 text-right">Inversión Total ($ Costo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {categoryChartData.map((c) => (
                  <tr key={c.name}>
                    <td className="py-2 px-3 font-bold text-slate-100 print:text-slate-900">{c.name}</td>
                    <td className="py-2 px-3 text-center font-mono">{c.cantidadProductos} ítems</td>
                    <td className="py-2 px-3 text-center font-mono">{c.unidades} unid.</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-400 print:text-slate-900">
                      ${c.valorCosto.toFixed(2)}
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
