import React, { useState } from 'react';
import { Sector, Movement } from '../types';
import { formatCurrency, exportToCSV } from '../utils/formatters';
import { 
  Building2, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  X, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Search,
  ArrowUpRight
} from 'lucide-react';

interface SectorsViewProps {
  sectors: Sector[];
  movements: Movement[];
  onSaveSector: (sectorData: Partial<Sector>) => Promise<void>;
  onDeleteSector: (id: string) => Promise<void>;
}

export const SectorsView: React.FC<SectorsViewProps> = ({
  sectors,
  movements,
  onSaveSector,
  onDeleteSector,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState<Partial<Sector>>({
    code: '',
    name: '',
    manager: '',
    costCenter: '',
    email: '',
    phone: '',
    location: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate stats for each sector (total items consumed, total cost)
  const sectorStats = sectors.map(sec => {
    const sectorExits = movements.filter(m => m.type === 'EXIT' && m.destinationSectorId === sec.id);
    const totalConsumedItems = sectorExits.reduce((acc, m) => acc + m.quantity, 0);
    const totalCost = sectorExits.reduce((acc, m) => acc + (m.totalValue || 0), 0);
    return {
      ...sec,
      totalExitsCount: sectorExits.length,
      totalConsumedItems,
      totalCost,
    };
  });

  const filteredSectors = sectorStats.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.costCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingSector(null);
    setFormData({
      code: `SEC-${String(sectors.length + 1).padStart(3, '0')}`,
      name: '',
      manager: '',
      costCenter: `CC-${(sectors.length + 1) * 1010}`,
      email: '',
      phone: '',
      location: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sector: Sector) => {
    setEditingSector(sector);
    setFormData({ ...sector });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormError('O nome do departamento/setor é obrigatório.');
      return;
    }
    if (!formData.manager?.trim()) {
      setFormError('O nome do responsável é obrigatório.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveSector({
        ...formData,
        id: editingSector ? editingSector.id : undefined,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar setor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = filteredSectors.map(s => ({
      Codigo: s.code,
      Nome: s.name,
      Responsavel: s.manager,
      Centro_Custo: s.costCenter,
      Email: s.email || '-',
      Telefone: s.phone || '-',
      Localizacao: s.location || '-',
      Total_Requisicoes: s.totalExitsCount,
      Custo_Total_Consumido: s.totalCost.toFixed(2),
    }));
    exportToCSV(`setores_departamentos_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  return (
    <div className="space-y-6" id="sectors-view-container">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Departamentos & Setores Corporativos
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Gerencie os centros de custo, gestores e departamentos consumidores de materiais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            id="add-sector-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo Setor
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do setor, centro de custo, código ou gestor..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSectors.map(sec => (
          <div
            key={sec.id}
            className="relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm transition hover:border-slate-700"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400">{sec.code}</span>
                    <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      {sec.costCenter}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Editar Setor"
                    onClick={() => handleOpenEdit(sec)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Excluir Setor"
                    onClick={() => {
                      if (confirm(`Excluir o setor "${sec.name}"?`)) {
                        onDeleteSector(sec.id);
                      }
                    }}
                    className="rounded p-1.5 text-red-400 hover:bg-red-500/20 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="mt-3 text-base font-bold text-white">{sec.name}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Responsável: <strong className="text-white">{sec.manager}</strong></span>
                </div>
                {sec.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span>{sec.email}</span>
                  </div>
                )}
                {sec.phone && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{sec.phone}</span>
                  </div>
                )}
                {sec.location && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{sec.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Consumption Summary */}
            <div className="mt-5 border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Consumido</span>
                  <p className="font-mono text-sm font-bold text-amber-300">
                    {formatCurrency(sec.totalCost)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Movimentações</span>
                  <p className="font-semibold text-slate-200">
                    {sec.totalExitsCount} baixas ({sec.totalConsumedItems} un)
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Adicionar / Editar Setor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#0e1b33] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingSector ? 'Editar Setor' : 'Cadastrar Novo Setor'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-lg border border-red-500/50 bg-red-950/40 p-2.5 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Código do Setor</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SEC-ADM"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Centro de Custo</label>
                  <input
                    type="text"
                    required
                    value={formData.costCenter || ''}
                    onChange={e => setFormData({ ...formData, costCenter: e.target.value })}
                    placeholder="CC-1010"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Setor / Departamento *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Manutenção & Engenharia"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Gestor / Responsável *</label>
                <input
                  type="text"
                  required
                  value={formData.manager || ''}
                  onChange={e => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Nome do supervisor ou gerente"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email de Contato</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="departamento@empresa.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Telefone / Ramal</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ramal 4022"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Localização Física / Bloco</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Bloco B - 2º Andar"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingSector ? 'Salvar Alterações' : 'Cadastrar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
