import React, { useState } from 'react';
import { Material, StockAlert } from '../types';
import { AlertTriangle, AlertOctagon, ArrowUpRight, ChevronDown, ChevronUp, BellRing, PackagePlus } from 'lucide-react';

interface StockNotificationBannerProps {
  alerts: StockAlert[];
  materials: Material[];
  onQuickRestock: (material: Material) => void;
}

export const StockNotificationBanner: React.FC<StockNotificationBannerProps> = ({
  alerts,
  materials,
  onQuickRestock,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div id="stock-notification-banner" className="mb-6 rounded-xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-[#0e1d38] to-[#1a1c29] p-4 shadow-lg shadow-black/40">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50">
            <BellRing className="h-5 w-5 animate-pulse text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
              {alerts.length}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-white">
                Alerta de Controle de Estoque Crítico / Baixo
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-950/80 px-2.5 py-0.5 text-xs font-semibold text-red-300 ring-1 ring-red-500/40">
                <AlertOctagon className="h-3 w-3 text-red-400" />
                {criticalCount} {criticalCount === 1 ? 'item esgotado' : 'itens esgotados'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 px-2.5 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/40">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                {warningCount} {warningCount === 1 ? 'abaixo do mínimo' : 'abaixo do mínimo'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              Atenção: Os materiais listados abaixo atingiram ou ultrapassaram a quantidade mínima de segurança definida no almoxarifado. Reposição recomendada.
            </p>
          </div>
        </div>

        {/* Action / Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            id="toggle-alerts-button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-amber-500/50 hover:bg-slate-700"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 text-amber-400" />
                Recolher Detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 text-amber-400" />
                Ver {alerts.length} {alerts.length === 1 ? 'Material' : 'Materiais'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded List of Materials with Low Stock */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map(alert => {
            const mat = materials.find(m => m.id === alert.materialId);
            const isCritical = alert.severity === 'critical';
            const percentage = alert.minQuantity > 0 ? Math.min(100, (alert.currentQuantity / alert.minQuantity) * 100) : 0;

            return (
              <div
                key={alert.materialId}
                id={`alert-card-${alert.materialId}`}
                className={`relative flex flex-col justify-between rounded-lg border p-3 transition-all ${
                  isCritical
                    ? 'border-red-500/50 bg-red-950/25 hover:border-red-400'
                    : 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-amber-400/90">
                      {alert.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-500 text-white shadow-xs'
                          : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                      }`}
                    >
                      {isCritical ? 'Esgotado' : 'Estoque Baixo'}
                    </span>
                  </div>

                  <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-100" title={alert.name}>
                    {alert.name}
                  </h4>

                  {/* Stock values: current vs minimum */}
                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400">Estoque Atual:</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-extrabold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                          {alert.currentQuantity}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">{alert.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400">Mínimo Definido:</span>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-sm font-bold text-slate-200">{alert.minQuantity}</span>
                        <span className="text-xs text-slate-400">{alert.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all ${isCritical ? 'bg-red-500' : 'bg-amber-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Restock CTA Button */}
                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Sugerido repor: <strong className="text-slate-200">+{alert.suggestedRestock} {alert.unit}</strong>
                  </span>
                  {mat && (
                    <button
                      type="button"
                      id={`restock-button-${alert.materialId}`}
                      onClick={() => onQuickRestock(mat)}
                      className="inline-flex items-center gap-1 rounded bg-amber-500 px-2 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-amber-400 shadow-xs active:scale-95"
                    >
                      <PackagePlus className="h-3 w-3 text-slate-950" />
                      Repor Estoque
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
