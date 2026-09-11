import React, { useState } from 'react';
import { Material, Sector, Movement, StockKPIs } from '../types';
import { formatCurrency, exportToCSV } from '../utils/formatters';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Layers, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle2, 
  PackageX,
  Search
} from 'lucide-react';

interface StockReportViewProps {
  materials: Material[];
  sectors: Sector[];
  movements: Movement[];
  kpis: StockKPIs;
}

export const StockReportView: React.FC<StockReportViewProps> = ({
  materials,
  sectors,
  movements,
  kpis,
}) => {
  const [reportTab, setReportTab] = useState<'materials' | 'sectors'>('materials');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate sector allocations
  const sectorAllocations = sectors.map(sec => {
    const exits = movements.filter(m => m.type === 'EXIT' && m.destinationSectorId === sec.id);
    const totalQty = exits.reduce((acc, m) => acc + m.quantity, 0);
    const totalVal = exits.reduce((acc, m) => acc + (m.totalValue || 0), 0);
    return {
      ...sec,
      exitsCount: exits.length,
      totalQuantityConsumed: totalQty,
      totalValueConsumed: totalVal,
    };
  }).sort((a, b) => b.totalValueConsumed - a.totalValueConsumed);

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportMaterials = () => {
    const data = materials.map(m => ({
      Codigo: m.code,
      Material: m.name,
      Categoria: m.category,
      Saldo_Atual: m.currentQuantity,
      Unidade: m.unit,
      Estoque_Minimo: m.minQuantity,
      Estoque_Maximo: m.maxQuantity,
      Custo_Unitario: m.unitCost.toFixed(2),
      Valor_Total: (m.currentQuantity * m.unitCost).toFixed(2),
      Situacao: m.currentQuantity === 0 ? 'Esgotado' : m.currentQuantity <= m.minQuantity ? 'Baixo' : m.currentQuantity > m.maxQuantity ? 'Excesso' : 'Normal',
      Localizacao: m.location,
    }));
    exportToCSV(`relatorio_posicao_estoque_${new Date().toISOString().split('T')[0]}`, data);
  };

  const handleExportSectors = () => {
    const data = sectorAllocations.map(s => ({
      Codigo_Setor: s.code,
      Nome_Setor: s.name,
      Centro_Custo: s.costCenter,
      Gestor: s.manager,
      Qtd_Requisicoes_Atendidas: s.exitsCount,
      Unidades_Consumidas: s.totalQuantityConsumed,
      Valor_Total_Consumido_RS: s.totalValueConsumed.toFixed(2),
    }));
    exportToCSV(`relatorio_consumo_setores_${new Date().toISOString().split('T')[0]}`, data);
  };

  return (
    <div className="space-y-6" id="stock-report-view-container">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Relatórios Gerenciais & Posição de Estoque
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Análise consolidada de inventário físico-financeiro e consumo por departamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reportTab === 'materials' ? handleExportMaterials : handleExportSectors}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            Exportar Relatório (CSV)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
          >
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Valor Total em Estoque
          </span>
          <p className="mt-1 text-xl font-extrabold text-amber-400 font-mono">
            {formatCurrency(kpis.totalStockValue)}
          </p>
          <span className="text-xs text-slate-500">{kpis.totalItems} materiais cadastrados</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Taxa de Giro / Rotatividade
          </span>
          <p className="mt-1 text-xl font-extrabold text-blue-400">
            {kpis.turnoverRate}%
          </p>
          <span className="text-xs text-slate-500">Relação consumo / estoque</span>
        </div>

        <div className="rounded-xl border border-red-900/40 bg-red-950/15 p-4">
          <span className="text-[11px] uppercase tracking-wider text-red-300 font-semibold">
            Itens Esgotados (Zero)
          </span>
          <p className="mt-1 text-xl font-extrabold text-red-400">
            {kpis.outOfStockCount}
          </p>
          <span className="text-xs text-red-300/80">Necessitam compra urgente</span>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/15 p-4">
          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
            Itens Abaixo do Mínimo
          </span>
          <p className="mt-1 text-xl font-extrabold text-amber-300">
            {kpis.lowStockCount}
          </p>
          <span className="text-xs text-amber-300/80">Ponto de pedido atingido</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setReportTab('materials')}
          className={`pb-3 border-b-2 transition ${
            reportTab === 'materials'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Posição Detalhada por Material & Saldo Físico-Financeiro
        </button>
        <button
          type="button"
          onClick={() => setReportTab('sectors')}
          className={`pb-3 border-b-2 transition ${
            reportTab === 'sectors'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Consumo & Alocação por Departamento / Centro de Custo
        </button>
      </div>

      {reportTab === 'materials' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-3 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nome do material ou código..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0c182d]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-[#091426] text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Código / Material</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-center">Saldo Atual</th>
                  <th className="px-4 py-3 text-center">Faixa (Mín / Máx)</th>
                  <th className="px-4 py-3 text-right">Custo Unitário</th>
                  <th className="px-4 py-3 text-right">Valor em Estoque</th>
                  <th className="px-4 py-3 text-center">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredMaterials.map(m => {
                  const val = m.currentQuantity * m.unitCost;
                  const isZero = m.currentQuantity === 0;
                  const isLow = m.currentQuantity > 0 && m.currentQuantity <= m.minQuantity;
                  const isHigh = m.currentQuantity > m.maxQuantity;

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-amber-400">{m.code}</span>
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.location}</div>
                      </td>
                      <td className="px-4 py-3">{m.category}</td>
                      <td className="px-4 py-3 text-center font-extrabold text-sm text-slate-100">
                        {m.currentQuantity} <span className="text-xs font-normal text-slate-400">{m.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">
                        {m.minQuantity} / {m.maxQuantity} {m.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        {formatCurrency(m.unitCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">
                        {formatCurrency(val)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isZero ? (
                          <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                            ESGOTADO
                          </span>
                        ) : isLow ? (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            ABAIXO DO MÍNIMO
                          </span>
                        ) : isHigh ? (
                          <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                            ACIMA DO LIMITE
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            REGULAR
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Sector Consumption Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sectorAllocations.map(sec => (
              <div
                key={sec.id}
                className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{sec.code}</span>
                  <span className="font-mono rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                    {sec.costCenter}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{sec.name}</h3>
                  <p className="text-xs text-slate-400">Gestor: {sec.manager}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Valor Consumido</span>
                    <p className="font-mono text-lg font-bold text-amber-300">
                      {formatCurrency(sec.totalValueConsumed)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Movimentações</span>
                    <p className="font-semibold text-slate-200">{sec.exitsCount} baixas</p>
                    <span className="text-[11px] text-slate-500">{sec.totalQuantityConsumed} unidades</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
