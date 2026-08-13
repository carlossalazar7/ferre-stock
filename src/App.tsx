import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { MovementsManager } from './components/MovementsManager';
import { InventoryLookup } from './components/InventoryLookup';
import { StockAlerts } from './components/StockAlerts';
import { ReportsView } from './components/ReportsView';
import { ScopeModal } from './components/ScopeModal';
import { QuickMovementModal } from './components/QuickMovementModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useInventory();
  const [isQuickMovementOpen, setIsQuickMovementOpen] = useState(false);
  const [preselectedProductForMovement, setPreselectedProductForMovement] = useState<string | undefined>(undefined);

  const handleOpenQuickMovement = (productId?: string) => {
    setPreselectedProductForMovement(productId);
    setIsQuickMovementOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header onOpenQuickMovement={() => handleOpenQuickMovement()} />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar />

        {/* View Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard onOpenQuickMovement={() => handleOpenQuickMovement()} />
          )}

          {activeTab === 'products' && <ProductManagement />}

          {activeTab === 'movements' && <MovementsManager />}

          {activeTab === 'lookup' && (
            <InventoryLookup
              onOpenQuickMovementWithProduct={(productId) => handleOpenQuickMovement(productId)}
            />
          )}

          {activeTab === 'alerts' && (
            <StockAlerts
              onOpenQuickMovementWithProduct={(productId) => handleOpenQuickMovement(productId)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Footer info bar */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 FerreStock — Sistema de Gestión de Inventario para Ferretería Medrano.</p>
          <p className="text-[11px] font-mono text-slate-600">
            Enfoque exclusivo en control de existencias • Módulos In-Scope activos
          </p>
        </div>
      </footer>

      {/* Scope Info Modal */}
      <ScopeModal />

      {/* Quick Movement Modal */}
      <QuickMovementModal
        isOpen={isQuickMovementOpen}
        onClose={() => setIsQuickMovementOpen(false)}
        preselectedProductId={preselectedProductForMovement}
      />
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainLayout />
    </InventoryProvider>
  );
}
