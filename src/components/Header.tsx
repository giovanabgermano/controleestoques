import React, { useState, useRef, useEffect } from 'react';
import { Material, StockAlert } from '../types';
import { 
  Boxes, 
  Bell, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText, 
  BookOpen, 
  Database, 
  ShieldCheck, 
  BarChart3, 
  Building2, 
  Layers, 
  AlertTriangle,
  PackagePlus,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  alerts: StockAlert[];
  materials: Material[];
  onOpenEntryModal: () => void;
  onOpenExitModal: () => void;
  onOpenNewRequisition: () => void;
  onQuickRestock: (material: Material) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  alerts,
  materials,
  onOpenEntryModal,
  onOpenExitModal,
  onOpenNewRequisition,
  onQuickRestock,
  onResetData,
}) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  const navItems = [
    { id: 'dashboard', label: 'Painel & KPIs', icon: BarChart3 },
    { id: 'materials', label: 'Materiais', icon: Layers },
    { id: 'sectors', label: 'Setores', icon: Building2 },
    { id: 'movements', label: 'Movimentações', icon: ArrowDownLeft },
    { id: 'requisitions', label: 'Requisições', icon: FileText },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'best-practices', label: 'Boas Práticas', icon: BookOpen },
    { id: 'database', label: 'Banco Relacional', icon: Database },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 border-b border-slate-800 bg-[#081020]/95 backdrop-blur-md">
      {/* Top Meta Bar with Technical Responsible & Quick Stats */}
      <div className="border-b border-slate-800/80 bg-[#060c18] px-4 py-1.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-400">Sistema Operacional de Almoxarifado</span>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <span className="hidden text-slate-300 sm:inline">
              Ambiente Corporativo Seguro (PostgreSQL / MySQL Ready)
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Technical Responsible Highlighted */}
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">Responsável Técnica:</span>
              <span className="font-semibold text-amber-400">Giovana B. Germano</span>
            </div>

            <button
              type="button"
              id="reset-seed-data-button"
              onClick={onResetData}
              title="Restaurar dados de demonstração padrão"
              className="hidden items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 md:flex transition"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar Dados
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20">
            <Boxes className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Controle de Estoque
              </h1>
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Gestão de Materiais, Movimentações e Requisições</p>
          </div>
        </div>

        {/* Action Buttons & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Entry Button */}
          <button
            type="button"
            id="quick-entry-header-btn"
            onClick={onOpenEntryModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/90 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span className="hidden md:inline">Registrar</span> Entrada
          </button>

          {/* Quick Exit Button */}
          <button
            type="button"
            id="quick-exit-header-btn"
            onClick={onOpenExitModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/90 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500 active:scale-95"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span className="hidden md:inline">Registrar</span> Saída
          </button>

          {/* Notification Bell with Stock Alert Badge */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id="notification-bell-button"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                alerts.length > 0
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
              title={alerts.length > 0 ? `${alerts.length} alertas de estoque baixo!` : 'Nenhum alerta de estoque pendente'}
            >
              <Bell className="h-4 w-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotificationsDropdown && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-700 bg-[#0e1a2f] p-3 shadow-2xl ring-1 ring-black/50 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Notificações de Estoque</h4>
                  </div>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                    {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-2 max-h-80 overflow-y-auto space-y-2 pr-1">
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Nenhum material com estoque baixo no momento. Todos os níveis estão regulares.
                    </div>
                  ) : (
                    alerts.map(a => {
                      const mat = materials.find(m => m.id === a.materialId);
                      const isCritical = a.severity === 'critical';
                      return (
                        <div
                          key={a.materialId}
                          className={`rounded-lg border p-2.5 transition ${
                            isCritical
                              ? 'border-red-500/40 bg-red-950/30'
                              : 'border-amber-500/40 bg-amber-950/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-mono text-[10px] text-amber-400 font-bold">{a.code}</span>
                            <span
                              className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${
                                isCritical ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {isCritical ? 'Esgotado (0)' : 'Estoque Baixo'}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-200 line-clamp-1">{a.name}</p>
                          <div className="mt-1.5 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              Atual: <strong className={isCritical ? 'text-red-400' : 'text-amber-400'}>{a.currentQuantity} {a.unit}</strong> (Mín: {a.minQuantity})
                            </span>
                            {mat && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNotificationsDropdown(false);
                                  onQuickRestock(mat);
                                }}
                                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
                              >
                                <PackagePlus className="h-3 w-3" />
                                Repor
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="border-t border-slate-800/80 bg-[#091426] px-4">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'materials' && alerts.length > 0 && (
                  <span
                    className={`ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                    }`}
                  >
                    {alerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
