import React from 'react';
import { Material, Movement, Sector, StockAlert, StockKPIs } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  DollarSign, 
  Boxes, 
  AlertTriangle, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PackageX, 
  TrendingUp, 
  FileText, 
  Layers,
  ChevronRight,
  PackagePlus,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  kpis: StockKPIs;
  alerts: StockAlert[];
  materials: Material[];
  movements: Movement[];
  sectors: Sector[];
  onOpenEntryModal: () => void;
  onOpenExitModal: () => void;
  onOpenNewMaterialModal: () => void;
  onOpenNewRequisitionModal: () => void;
  onQuickRestock: (material: Material) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  alerts,
  materials,
  movements,
  sectors,
  onOpenEntryModal,
  onOpenExitModal,
  onOpenNewMaterialModal,
  onOpenNewRequisitionModal,
  onQuickRestock,
  onNavigateToTab,
}) => {
  const recentMovements = movements.slice(0, 6);

  // Group materials by category
  const categoriesMap: Record<string, { count: number; totalValue: number }> = {};
  materials.forEach(m => {
    if (!categoriesMap[m.category]) {
      categoriesMap[m.category] = { count: 0, totalValue: 0 };
    }
    categoriesMap[m.category].count += 1;
    categoriesMap[m.category].totalValue += m.currentQuantity * m.unitCost;
  });

  const categories = Object.entries(categoriesMap).sort((a, b) => b[1].totalValue - a[1].totalValue);

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#0d1b33] p-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Painel Executivo de Controle de Estoque
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Visão consolidada de inventário, alertas de reposição de almoxarifado e fluxo de movimentações operacionais.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="dash-btn-entry"
            onClick={onOpenEntryModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Nova Entrada
          </button>

          <button
            type="button"
            id="dash-btn-exit"
            onClick={onOpenExitModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
          >
            <ArrowUpRight className="h-4 w-4" />
            Nova Saída
          </button>

          <button
            type="button"
            id="dash-btn-req"
            onClick={onOpenNewRequisitionModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            Nova Requisição
          </button>

          <button
            type="button"
            id="dash-btn-new-mat"
            onClick={onOpenNewMaterialModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700 active:scale-95"
          >
            <PackagePlus className="h-4 w-4 text-amber-400" />
            Cadastrar Material
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Valor Total em Estoque */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Valor Total em Estoque
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">
            {formatCurrency(kpis.totalStockValue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>{kpis.totalUnitsInStock} unidades físicas alocadas</span>
          </div>
        </div>

        {/* Card 2: Alerta de Estoque Baixo / Crítico */}
        <div 
          onClick={() => onNavigateToTab('materials')}
          className="relative cursor-pointer overflow-hidden rounded-xl border border-amber-500/40 bg-[#161f36] p-5 shadow-sm transition hover:border-amber-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Estoque Baixo / Mínimo
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {alerts.length}
            </p>
            <span className="text-xs text-slate-300">materiais em alerta</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-red-400 font-medium">{kpis.outOfStockCount} esgotados</span>
            <span className="text-amber-300 font-medium">{kpis.lowStockCount} abaixo do mín.</span>
          </div>
        </div>

        {/* Card 3: Taxa de Rotatividade (Turnover) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Taxa de Rotatividade
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">
            {kpis.turnoverRate}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Giro de saídas sobre o inventário ativo</span>
          </div>
        </div>

        {/* Card 4: Total de Materiais & Setores */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Materiais Ativos
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white tracking-tight">
            {kpis.totalItems} itens
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>{sectors.length} setores atendidos</span>
            <span className="text-emerald-400 font-medium">{kpis.totalMovementsCount} movimentações</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Critical Stock Monitor & Recent Movements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Attention Items & Category Breakdown */}
        <div className="space-y-6 lg:col-span-2">
          {/* Alerta Visual de Reposição */}
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Materiais que Requerem Reposição Imediata
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('materials')}
                className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Ver todos no Catálogo <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/80">
              {alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    Estoque em Nível Seguro
                  </p>
                  <p className="text-xs text-slate-400">
                    Nenhum item está abaixo da quantidade mínima cadastrada.
                  </p>
                </div>
              ) : (
                alerts.map(alert => {
                  const mat = materials.find(m => m.id === alert.materialId);
                  const isCritical = alert.severity === 'critical';
                  return (
                    <div key={alert.materialId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                            isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {isCritical ? <PackageX className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400">{alert.code}</span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                                isCritical ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {isCritical ? 'Esgotado' : 'Estoque Baixo'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-100">{alert.name}</p>
                          <p className="text-xs text-slate-400">
                            Estoque atual: <strong className={isCritical ? 'text-red-400' : 'text-amber-400'}>{alert.currentQuantity} {alert.unit}</strong> | Mínimo estipulado: {alert.minQuantity} {alert.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-xs text-slate-400">
                          Repor: +{alert.suggestedRestock} {alert.unit}
                        </span>
                        {mat && (
                          <button
                            type="button"
                            onClick={() => onQuickRestock(mat)}
                            className="inline-flex items-center gap-1.5 rounded bg-amber-500 px-2.5 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95"
                          >
                            <PackagePlus className="h-3.5 w-3.5" />
                            Registrar Entrada
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Categorias & Posição de Valor */}
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Distribuição de Capital por Categoria
                </h3>
              </div>
              <span className="text-xs text-slate-400">{categories.length} categorias</span>
            </div>

            <div className="mt-4 space-y-3">
              {categories.map(([catName, data]) => {
                const percentage = kpis.totalStockValue > 0 ? (data.totalValue / kpis.totalStockValue) * 100 : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{catName} ({data.count} itens)</span>
                      <span className="font-mono text-amber-300">{formatCurrency(data.totalValue)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Movements */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Últimas Movimentações
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('movements')}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Ver histórico
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/80">
              {recentMovements.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  Nenhuma movimentação registrada até o momento.
                </p>
              ) : (
                recentMovements.map(mov => {
                  const isEntry = mov.type === 'ENTRY';
                  return (
                    <div key={mov.id} className="py-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            isEntry ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {isEntry ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {isEntry ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                        <span className="text-slate-400">{formatDate(mov.date)}</span>
                      </div>

                      <p className="mt-1 font-semibold text-slate-100 line-clamp-1">{mov.materialName}</p>

                      <div className="mt-1 flex items-center justify-between text-slate-400">
                        <span>
                          Qtd: <strong className="text-slate-200">{mov.quantity} {mov.unit}</strong>
                        </span>
                        {mov.totalValue && (
                          <span className="font-mono text-amber-400 font-medium">
                            {formatCurrency(mov.totalValue)}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-400">
                        {isEntry ? (
                          <span>Fornecedor: {mov.supplier || 'Não informado'}</span>
                        ) : (
                          <span>Destino: {mov.destinationSectorName || 'Setor padrão'}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Sector Distribution Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Setores Corporativos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('sectors')}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Gerenciar
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {sectors.map(sec => (
                <div key={sec.id} className="flex items-center justify-between rounded-lg bg-slate-900/60 p-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{sec.name}</span>
                    <p className="text-[11px] text-slate-400">Resp: {sec.manager}</p>
                  </div>
                  <span className="font-mono text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-amber-400">
                    {sec.costCenter}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
