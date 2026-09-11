import React, { useState } from 'react';
import { Movement, Material, Sector, MovementType } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter, 
  Search, 
  Download, 
  Plus, 
  Calendar, 
  Layers, 
  Building2, 
  FileSpreadsheet,
  X
} from 'lucide-react';

interface MovementsViewProps {
  movements: Movement[];
  materials: Material[];
  sectors: Sector[];
  onOpenEntryModal: () => void;
  onOpenExitModal: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  materials,
  sectors,
  onOpenEntryModal,
  onOpenExitModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ALL');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter movements
  const filteredMovements = movements.filter(m => {
    // Type filter
    if (selectedType !== 'ALL' && m.type !== selectedType) {
      return false;
    }
    // Material filter
    if (selectedMaterialId !== 'ALL' && m.materialId !== selectedMaterialId) {
      return false;
    }
    // Sector filter
    if (selectedSectorId !== 'ALL' && m.destinationSectorId !== selectedSectorId) {
      return false;
    }
    // Date range
    if (startDate && m.date < startDate) {
      return false;
    }
    if (endDate && m.date > endDate) {
      return false;
    }
    // Search text
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchText = 
        m.materialName.toLowerCase().includes(q) ||
        m.materialCode.toLowerCase().includes(q) ||
        (m.supplier && m.supplier.toLowerCase().includes(q)) ||
        (m.requester && m.requester.toLowerCase().includes(q)) ||
        (m.invoiceNumber && m.invoiceNumber.toLowerCase().includes(q)) ||
        (m.reason && m.reason.toLowerCase().includes(q)) ||
        (m.destinationSectorName && m.destinationSectorName.toLowerCase().includes(q));

      if (!matchText) return false;
    }

    return true;
  });

  // Calculate totals from filtered
  const totalEntriesValue = filteredMovements
    .filter(m => m.type === 'ENTRY')
    .reduce((acc, m) => acc + (m.totalValue || 0), 0);

  const totalExitsValue = filteredMovements
    .filter(m => m.type === 'EXIT')
    .reduce((acc, m) => acc + (m.totalValue || 0), 0);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedMaterialId('ALL');
    setSelectedSectorId('ALL');
    setStartDate('');
    setEndDate('');
  };

  const handleExportCSV = () => {
    const dataToExport = filteredMovements.map(m => ({
      ID: m.id,
      Tipo: m.type === 'ENTRY' ? 'Entrada' : 'Saida',
      Data: m.date,
      Codigo_Material: m.materialCode,
      Nome_Material: m.materialName,
      Quantidade: m.quantity,
      Unidade: m.unit,
      Custo_Unitario: m.unitCost?.toFixed(2) || '0.00',
      Valor_Total: m.totalValue?.toFixed(2) || '0.00',
      Fornecedor: m.supplier || '-',
      Nota_Fiscal: m.invoiceNumber || '-',
      Setor_Destino: m.destinationSectorName || '-',
      Solicitante: m.requester || '-',
      Motivo: m.reason || '-',
      Observacoes: m.notes || '-',
      Registrado_Por: m.registeredBy,
    }));
    exportToCSV(`historico_movimentacoes_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  return (
    <div className="space-y-6" id="movements-view-container">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Histórico & Registro de Movimentações
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe o fluxo contábil e físico de entradas e saídas de materiais no estoque.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            Exportar Histórico
          </button>
          <button
            type="button"
            id="register-entry-btn"
            onClick={onOpenEntryModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Registrar Entrada
          </button>
          <button
            type="button"
            id="register-exit-btn"
            onClick={onOpenExitModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
          >
            <ArrowUpRight className="h-4 w-4" />
            Registrar Saída
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4">
          <span className="text-xs text-slate-400">Movimentações Filtradas</span>
          <p className="mt-1 text-xl font-extrabold text-white">{filteredMovements.length} registros</p>
        </div>
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold">Total em Entradas</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-emerald-300 font-mono">
            {formatCurrency(totalEntriesValue)}
          </p>
        </div>
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/15 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-400 font-semibold">Total em Saídas / Baixas</span>
            <ArrowUpRight className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-blue-300 font-mono">
            {formatCurrency(totalExitsValue)}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          {/* Search Input */}
          <div className="relative sm:col-span-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por material, NF, fornecedor, solicitante..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">Todas Movimentações</option>
              <option value="ENTRY">Apenas Entradas (Recebimento)</option>
              <option value="EXIT">Apenas Saídas (Consumo)</option>
            </select>
          </div>

          {/* Material Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedMaterialId}
              onChange={e => setSelectedMaterialId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">Todos os Materiais</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSectorId}
              onChange={e => setSelectedSectorId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="ALL">Todos os Setores</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Período:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <span className="text-slate-500">até</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {(searchTerm || selectedType !== 'ALL' || selectedMaterialId !== 'ALL' || selectedSectorId !== 'ALL' || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition"
            >
              <X className="h-3.5 w-3.5" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0c182d] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-[#091426] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3 text-center">Quantidade</th>
                <th className="px-4 py-3 text-right">Valor Total</th>
                <th className="px-4 py-3">Origem / Destino / Motivo</th>
                <th className="px-4 py-3">Responsável Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Nenhuma movimentação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(mov => {
                  const isEntry = mov.type === 'ENTRY';
                  return (
                    <tr key={mov.id} className="transition-colors hover:bg-slate-800/40">
                      {/* Tipo */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold ${
                            isEntry
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {isEntry ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {isEntry ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </td>

                      {/* Data */}
                      <td className="px-4 py-3 font-medium text-slate-200">
                        {formatDate(mov.date)}
                      </td>

                      {/* Material */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-amber-400">{mov.materialCode}</span>
                        <div className="font-semibold text-white">{mov.materialName}</div>
                      </td>

                      {/* Quantidade */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-sm font-extrabold ${
                            isEntry ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {isEntry ? '+' : '-'}{mov.quantity}
                        </span>
                        <span className="ml-1 text-[11px] text-slate-400">{mov.unit}</span>
                      </td>

                      {/* Valor Total */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">
                        {mov.totalValue ? formatCurrency(mov.totalValue) : '-'}
                      </td>

                      {/* Origem / Destino / Motivo */}
                      <td className="px-4 py-3">
                        {isEntry ? (
                          <div>
                            <span className="font-semibold text-slate-200">{mov.supplier || 'Fornecedor padrão'}</span>
                            {mov.invoiceNumber && (
                              <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-amber-300">
                                {mov.invoiceNumber}
                              </span>
                            )}
                            {mov.notes && <p className="text-[11px] text-slate-400 line-clamp-1">{mov.notes}</p>}
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-200">
                              {mov.destinationSectorName || 'Setor padrão'}
                            </span>
                            <span className="text-slate-400"> (Solicitante: {mov.requester})</span>
                            {mov.reason && <p className="text-[11px] text-slate-400 line-clamp-1">{mov.reason}</p>}
                          </div>
                        )}
                      </td>

                      {/* Responsável */}
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {mov.registeredBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
