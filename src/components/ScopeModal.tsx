import React from 'react';
import { X, CheckCircle2, XCircle, Shield, Info } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const ScopeModal: React.FC = () => {
  const { showScopeModal, setShowScopeModal } = useInventory();

  if (!showScopeModal) return null;

  const inScopeList = [
    { title: '1. Módulo de gestión de productos', desc: 'Registro, consulta, actualización y desactivación de productos (código, nombre, descripción, categoría, precio, cantidad disponible y stock mínimo).' },
    { title: '2. Control de entradas y salidas', desc: 'Registro de movimientos de ingreso (compras/reabastecimiento) y egreso (ventas/mermas) con actualización automática del saldo e historial de cambios.' },
    { title: '3. Consulta de inventario', desc: 'Búsqueda ágil de productos, visualización de cantidades actuales y estado de existencias en mostrador o almacén.' },
    { title: '4. Alertas de stock mínimo', desc: 'Mecanismo visual y panel de notificaciones para identificar productos con cantidad disponible igual o inferior al límite mínimo.' },
    { title: '5. Módulo de reportes', desc: 'Generación e impresión de reportes de productos existentes, bajo stock, entradas, salidas y estado general del inventario.' },
    { title: '6. Gestión básica de usuarios y roles', desc: 'Simulación y diferenciación de permisos de acceso según perfil (Administrador, Encargado de Inventario y Vendedor).' },
  ];

  const outOfScopeList = [
    'No se incluye facturación electrónica.',
    'No se incluye administración contable o financiera.',
    'No se incluye módulo de recursos humanos.',
    'No se incluye gestión de proveedores independiente.',
    'No se incluye sistema de compras completo (Órdenes de compra/aprobaciones).',
    'No se incluye integración con bancos o sistemas externos.',
    'No se incluye aplicación móvil nativa (Android/iOS).',
    'No se incluyen algoritmos de Inteligencia Artificial de ventas/demanda.',
    'No se incluye soporte multi-sucursal en esta versión.',
    'No se incluye integración con lectores de código de barras.',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Alcance del Proyecto: FerreStock</h2>
              <p className="text-xs text-slate-400">Especificación oficial para Ferretería Medrano</p>
            </div>
          </div>
          <button
            onClick={() => setShowScopeModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* IN SCOPE SECTION */}
          <div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Funcionalidades Incluidas (IN SCOPE)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inScopeList.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-emerald-900/40 text-xs">
                  <p className="font-bold text-slate-100 mb-1">{item.title}</p>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* OUT OF SCOPE SECTION */}
          <div>
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Fuera del Alcance (OUT OF SCOPE)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outOfScopeList.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-rose-950 text-xs text-slate-400 flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowScopeModal(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
