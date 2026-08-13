import React, { useState } from 'react';
import {
  Boxes,
  Bell,
  PlusCircle,
  User,
  ChevronDown,
  Info,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface HeaderProps {
  onOpenQuickMovement: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickMovement }) => {
  const {
    currentUser,
    users,
    switchUser,
    stockAlerts,
    criticalAlertsCount,
    setActiveTab,
    setShowScopeModal,
    resetToDemoData,
    toast,
  } = useInventory();

  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-amber-400 tracking-tight">FerreStock</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                v1.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Ferretería Medrano • Control de Inventarios</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Register Movement Button */}
          <button
            onClick={onOpenQuickMovement}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95"
            title="Registrar entrada o salida rápidamente"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Registrar Movimiento</span>
            <span className="md:hidden">Movimiento</span>
          </button>

          {/* Stock Alert Badge Trigger */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Ver alertas de stock mínimo"
          >
            <Bell className="w-5 h-5" />
            {stockAlerts.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white animate-pulse ${
                  criticalAlertsCount > 0 ? 'bg-red-500' : 'bg-amber-500'
                }`}
              >
                {stockAlerts.length}
              </span>
            )}
          </button>

          {/* Scope Info Button */}
          <button
            onClick={() => setShowScopeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Ver Alcance del Proyecto (In Scope / Out of Scope)"
          >
            <Info className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline font-medium">Alcance del Proyecto</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-amber-400 font-mono">{currentUser.roleTitle}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-700/60">
                  <p className="text-xs text-slate-400 font-medium">Cambiar Rol / Simular Usuario</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Controla las vistas y permisos disponibles</p>
                </div>
                <div className="py-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                        currentUser.id === u.id ? 'bg-slate-700/40 text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${u.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.roleTitle}</p>
                        </div>
                      </div>
                      {currentUser.id === u.id && <ShieldCheck className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-700/60 pt-1 mt-1 px-3 py-1">
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 py-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restablecer Datos de Demostración</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950 border-rose-500/50 text-rose-200'
                : 'bg-slate-900 border-amber-500/50 text-amber-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </header>
  );
};
