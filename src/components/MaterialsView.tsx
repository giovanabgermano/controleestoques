import React, { useState } from 'react';
import { Material, UnitOfMeasure } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  PackageX, 
  CheckCircle2, 
  Maximize2,
  X,
  Package,
  Layers
} from 'lucide-react';

interface MaterialsViewProps {
  materials: Material[];
  onSaveMaterial: (materialData: Partial<Material>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onQuickEntry: (material: Material) => void;
  onQuickExit: (material: Material) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  onSaveMaterial,
  onDeleteMaterial,
  onQuickEntry,
  onQuickExit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    code: '',
    description: '',
    category: 'Manutenção',
    unit: 'UN',
    minQuantity: 10,
    maxQuantity: 100,
    currentQuantity: 0,
    unitCost: 0,
    location: 'Corredor 1 - Prateleira A',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories
  const categories = Array.from(new Set(materials.map(m => m.category))).sort();

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'out_of_stock') {
      matchesStatus = m.currentQuantity === 0;
    } else if (selectedStatus === 'low') {
      matchesStatus = m.currentQuantity > 0 && m.currentQuantity <= m.minQuantity;
    } else if (selectedStatus === 'excess') {
      matchesStatus = m.currentQuantity > m.maxQuantity;
    } else if (selectedStatus === 'normal') {
      matchesStatus = m.currentQuantity > m.minQuantity && m.currentQuantity <= m.maxQuantity;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      code: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
      description: '',
      category: 'Geral',
      unit: 'UN',
      minQuantity: 10,
      maxQuantity: 100,
      currentQuantity: 0,
      unitCost: 0,
      location: 'Almoxarifado Central',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      ...material,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormError('O nome do material é obrigatório.');
      return;
    }
    if (Number(formData.minQuantity) < 0) {
      setFormError('A quantidade mínima não pode ser negativa.');
      return;
    }
    if (Number(formData.maxQuantity) < Number(formData.minQuantity)) {
      setFormError('A quantidade máxima deve ser maior ou igual à quantidade mínima.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveMaterial({
        ...formData,
        id: editingMaterial ? editingMaterial.id : undefined,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = filteredMaterials.map(m => ({
      Codigo: m.code,
      Nome: m.name,
      Categoria: m.category,
      Unidade: m.unit,
      Estoque_Atual: m.currentQuantity,
      Estoque_Minimo: m.minQuantity,
      Estoque_Maximo: m.maxQuantity,
      Custo_Unitario: m.unitCost,
      Valor_Total: (m.currentQuantity * m.unitCost).toFixed(2),
      Localizacao: m.location,
      Status: m.currentQuantity === 0 ? 'Esgotado' : m.currentQuantity <= m.minQuantity ? 'Baixo' : m.currentQuantity > m.maxQuantity ? 'Excesso' : 'Normal',
    }));
    exportToCSV(`inventario_materiais_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  return (
    <div className="space-y-6" id="materials-view-container">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Catálogo & Gestão de Materiais
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Cadastre itens, acompanhe saldos em tempo real, parametrize estoques mínimos e máximos.
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
            id="add-material-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Novo Material
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-[#0c182d] p-4 sm:grid-cols-12">
        {/* Search text */}
        <div className="relative sm:col-span-6 lg:col-span-5">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="search-materials-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nome, categoria ou prateleira..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3 lg:col-span-4">
          <select
            id="filter-category-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3 lg:col-span-3">
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">Todos os Níveis de Saldo</option>
            <option value="low">⚠️ Estoque Baixo (≤ Mínimo)</option>
            <option value="out_of_stock">⛔ Esgotados (0 em Estoque)</option>
            <option value="normal">✅ Normal (Dentro dos Limites)</option>
            <option value="excess">📦 Excesso (&gt; Máximo)</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0c182d] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-[#091426] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Código / Material</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-center">Unidade</th>
                <th className="px-4 py-3 text-center">Saldo Atual</th>
                <th className="px-4 py-3">Faixa Segura (Mín / Máx)</th>
                <th className="px-4 py-3 text-right">Custo Unitário</th>
                <th className="px-4 py-3 text-right">Total Valorizado</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Nenhum material encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(mat => {
                  const isOutOfStock = mat.currentQuantity === 0;
                  const isLowStock = mat.currentQuantity > 0 && mat.currentQuantity <= mat.minQuantity;
                  const isExcess = mat.currentQuantity > mat.maxQuantity;
                  const totalValue = mat.currentQuantity * mat.unitCost;

                  // Barra percentual
                  const percentOfMax = mat.maxQuantity > 0 
                    ? Math.min(100, (mat.currentQuantity / mat.maxQuantity) * 100) 
                    : 0;

                  return (
                    <tr 
                      key={mat.id} 
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isOutOfStock ? 'bg-red-950/15' : isLowStock ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Código e Nome */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-amber-400">{mat.code}</span>
                              {isOutOfStock && (
                                <span className="rounded bg-red-500/20 px-1.5 py-0.2 text-[9px] font-bold text-red-400">
                                  ESGOTADO
                                </span>
                              )}
                              {isLowStock && (
                                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                  BAIXO
                                </span>
                              )}
                              {isExcess && (
                                <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-300">
                                  EXCESSO
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-100">{mat.name}</div>
                            {mat.description && (
                              <div className="text-[11px] text-slate-400 line-clamp-1">{mat.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300">
                          {mat.category}
                        </span>
                      </td>

                      {/* Unidade */}
                      <td className="px-4 py-3 text-center font-bold text-slate-200">
                        {mat.unit}
                      </td>

                      {/* Saldo Atual com destaque */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-sm font-extrabold ${
                              isOutOfStock
                                ? 'text-red-400'
                                : isLowStock
                                ? 'text-amber-400'
                                : isExcess
                                ? 'text-purple-300'
                                : 'text-emerald-400'
                            }`}
                          >
                            {mat.currentQuantity}
                          </span>
                          <span className="text-[10px] text-slate-400">{mat.unit}</span>
                        </div>
                      </td>

                      {/* Faixa Segura Mín/Máx + Mini Barra */}
                      <td className="px-4 py-3">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Mín: {mat.minQuantity}</span>
                            <span>Máx: {mat.maxQuantity}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isOutOfStock
                                  ? 'bg-red-500'
                                  : isLowStock
                                  ? 'bg-amber-400'
                                  : isExcess
                                  ? 'bg-purple-500'
                                  : 'bg-emerald-400'
                              }`}
                              style={{ width: `${percentOfMax}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Custo Unitário */}
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        {formatCurrency(mat.unitCost)}
                      </td>

                      {/* Total Valorizado */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">
                        {formatCurrency(totalValue)}
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {mat.location || '-'}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Entrada rápida */}
                          <button
                            type="button"
                            title="Registrar Entrada deste material"
                            onClick={() => onQuickEntry(mat)}
                            className="rounded p-1.5 text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            <ArrowDownLeft className="h-4 w-4" />
                          </button>

                          {/* Saída rápida */}
                          <button
                            type="button"
                            title="Registrar Saída deste material"
                            disabled={mat.currentQuantity === 0}
                            onClick={() => onQuickExit(mat)}
                            className="rounded p-1.5 text-blue-400 hover:bg-blue-500/20 disabled:opacity-30 transition"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            title="Editar Material"
                            onClick={() => handleOpenEdit(mat)}
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            title="Excluir Material"
                            onClick={() => {
                              if (confirm(`Deseja realmente remover o material "${mat.name}"?`)) {
                                onDeleteMaterial(mat.id);
                              }
                            }}
                            className="rounded p-1.5 text-red-400 hover:bg-red-500/20 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Criar / Editar Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0e1b33] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingMaterial ? 'Editar Material' : 'Cadastrar Novo Material'}
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">Código (SKU)</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="MAT-001"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Nome do Material *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Papel Sulfite A4 75g"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição Técnica / Detalhes</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Especificações, marca recomendada, finalidade..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria *</label>
                  <input
                    type="text"
                    required
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Manutenção, EPI, TI..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unidade de Medida *</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as UnitOfMeasure })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="UN">UN - Unidade</option>
                    <option value="CX">CX - Caixa</option>
                    <option value="PCT">PCT - Pacote</option>
                    <option value="KG">KG - Quilograma</option>
                    <option value="G">G - Grama</option>
                    <option value="M">M - Metro</option>
                    <option value="M2">M² - Metro Quadrado</option>
                    <option value="L">L - Litro</option>
                    <option value="ML">ML - Mililitro</option>
                    <option value="PAR">PAR - Par</option>
                    <option value="ROLO">ROLO - Rolo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-amber-300 mb-1">Qtd. Mínima *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.minQuantity ?? 0}
                    onChange={e => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-amber-500/50 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Qtd. Máxima *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.maxQuantity ?? 100}
                    onChange={e => setFormData({ ...formData, maxQuantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Saldo Inicial</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    disabled={!!editingMaterial}
                    value={formData.currentQuantity ?? 0}
                    onChange={e => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost ?? 0}
                    onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Localização no Almoxarifado</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Corredor 2 - Prateleira B1"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
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
                  {isSubmitting ? 'Salvando...' : editingMaterial ? 'Atualizar Material' : 'Cadastrar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
