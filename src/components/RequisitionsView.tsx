import React, { useState } from 'react';
import { Requisition, RequisitionPriority, RequisitionStatus, Material, Sector, RequisitionItem } from '../types';
import { formatDate, formatDateTime } from '../utils/formatters';
import { 
  FileText, 
  Printer, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Building2, 
  User, 
  Package, 
  Trash2, 
  Eye, 
  X,
  Boxes,
  ShieldCheck
} from 'lucide-react';

interface RequisitionsViewProps {
  requisitions: Requisition[];
  materials: Material[];
  sectors: Sector[];
  onSaveRequisition: (reqData: Partial<Requisition>) => Promise<void>;
  onUpdateStatus: (id: string, status: RequisitionStatus, deliverItems?: boolean) => Promise<void>;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  requisitions,
  materials,
  sectors,
  onSaveRequisition,
  onUpdateStatus,
}) => {
  const [selectedReqForPrint, setSelectedReqForPrint] = useState<Requisition | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Requisition Form State
  const [requesterName, setRequesterName] = useState('');
  const [requesterRole, setRequesterRole] = useState('');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || '');
  const [priority, setPriority] = useState<RequisitionPriority>('MEDIA');
  const [purpose, setPurpose] = useState('');
  const [items, setItems] = useState<RequisitionItem[]>([
    {
      id: `item-${Date.now()}`,
      materialId: materials[0]?.id || '',
      materialCode: materials[0]?.code || '',
      materialName: materials[0]?.name || '',
      unit: materials[0]?.unit || 'UN',
      quantityRequested: 1,
    },
  ]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRequisitions = requisitions.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const handleAddItemRow = () => {
    const defaultMat = materials[0];
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${items.length}`,
        materialId: defaultMat?.id || '',
        materialCode: defaultMat?.code || '',
        materialName: defaultMat?.name || '',
        unit: defaultMat?.unit || 'UN',
        quantityRequested: 1,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemMaterialChange = (index: number, matId: string) => {
    const mat = materials.find(m => m.id === matId);
    if (!mat) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      materialId: mat.id,
      materialCode: mat.code,
      materialName: mat.name,
      unit: mat.unit,
    };
    setItems(updated);
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantityRequested: Math.max(0.01, qty),
    };
    setItems(updated);
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!requesterName.trim()) {
      setFormError('Informe o nome do solicitante.');
      return;
    }
    if (!purpose.trim()) {
      setFormError('Informe a finalidade / justificativa da requisição.');
      return;
    }
    if (items.length === 0) {
      setFormError('Adicione pelo menos um item à requisição.');
      return;
    }

    const chosenSector = sectors.find(s => s.id === sectorId);

    try {
      setIsSubmitting(true);
      await onSaveRequisition({
        requesterName,
        requesterRole: requesterRole || 'Colaborador',
        sectorId,
        sectorName: chosenSector?.name || 'Setor',
        priority,
        purpose,
        items,
      });

      setIsNewModalOpen(false);
      // Reset form
      setRequesterName('');
      setPurpose('');
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar requisição.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPriorityBadge = (p: RequisitionPriority) => {
    switch (p) {
      case 'URGENTE':
        return <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">URGENTE</span>;
      case 'ALTA':
        return <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">ALTA</span>;
      case 'MEDIA':
        return <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">MÉDIA</span>;
      default:
        return <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">BAIXA</span>;
    }
  };

  const getStatusBadge = (s: RequisitionStatus) => {
    switch (s) {
      case 'ATENDIDA':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" /> Atendida
          </span>
        );
      case 'APROVADA':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400">
            <Clock className="h-3.5 w-3.5" /> Aprovada
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-400">
            <XCircle className="h-3.5 w-3.5" /> Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" /> Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="requisitions-view-container">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Requisições Formais de Materiais
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Emita pedidos formais com aprovação hierárquica e gere formulários impressos (PDF/Print-Ready).
          </p>
        </div>

        <button
          type="button"
          id="new-requisition-btn"
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Nova Requisição
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-semibold text-slate-400">Filtrar por Status:</span>
        {['ALL', 'PENDENTE', 'APROVADA', 'ATENDIDA', 'CANCELADA'].map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {st === 'ALL' ? 'Todas' : st}
          </button>
        ))}
      </div>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-12 text-center text-slate-400">
            Nenhuma requisição encontrada para este filtro.
          </div>
        ) : (
          filteredRequisitions.map(req => {
            const isPending = req.status === 'PENDENTE';
            const isApproved = req.status === 'APROVADA';

            return (
              <div
                key={req.id}
                className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 font-mono font-bold text-xs">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-amber-400">{req.code}</span>
                        {getPriorityBadge(req.priority)}
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-slate-400">
                        Data do Pedido: {formatDate(req.date)} | Setor: <strong className="text-slate-200">{req.sectorName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Printable Document */}
                    <button
                      type="button"
                      onClick={() => setSelectedReqForPrint(req)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Visualizar / Imprimir (PDF)
                    </button>

                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(req.id, 'APROVADA')}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
                      >
                        Aprovar
                      </button>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(req.id, 'ATENDIDA', true)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                        title="Atender requisição e baixar saldo do estoque automaticamente"
                      >
                        Atender & Baixar Estoque
                      </button>
                    )}

                    {(isPending || isApproved) && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(req.id, 'CANCELADA')}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-400">Solicitante:</span>{' '}
                    <strong className="text-slate-200">{req.requesterName}</strong> ({req.requesterRole})
                    <p className="mt-1 text-slate-300">
                      <strong className="text-slate-400">Justificativa:</strong> {req.purpose}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400">Almoxarife Responsável:</span>{' '}
                    <span className="text-amber-400 font-semibold">{req.warehouseClerk || 'Giovana B. Germano'}</span>
                    {req.deliveredAt && (
                      <p className="mt-1 text-emerald-400">
                        Entregue em: {formatDateTime(req.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items preview table */}
                <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                        <th className="py-1">Código</th>
                        <th className="py-1">Material</th>
                        <th className="py-1 text-center">Qtd. Solicitada</th>
                        <th className="py-1 text-center">Qtd. Entregue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {req.items.map(it => (
                        <tr key={it.id}>
                          <td className="py-1.5 font-mono text-[11px] text-amber-400">{it.materialCode}</td>
                          <td className="py-1.5 text-slate-200 font-medium">{it.materialName}</td>
                          <td className="py-1.5 text-center font-bold text-white">
                            {it.quantityRequested} {it.unit}
                          </td>
                          <td className="py-1.5 text-center font-bold text-emerald-400">
                            {it.quantityDelivered !== undefined ? `${it.quantityDelivered} ${it.unit}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PRINT-FRIENDLY REQUISITION MODAL (PDF / PRINTABLE LAYOUT) */}
      {selectedReqForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl border border-slate-700 bg-white p-8 text-slate-900 shadow-2xl my-8 print:p-0 print:border-none print:shadow-none print:m-0">
            {/* Screen-Only Controls Bar */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-700" />
                <span className="font-bold text-slate-800">
                  Visualização de Impressão Oficial (A4 Formato Corporativo)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="print-requisition-action-btn"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir / Salvar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReqForPrint(null)}
                  className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE SHEET CONTENT (Clean Corporate A4 Format) */}
            <div id="printable-requisition-sheet" className="space-y-6 text-slate-900 font-sans">
              {/* Official Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
                    <Boxes className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                      Sistema de Controle de Estoque
                    </h1>
                    <p className="text-xs text-slate-600">Almoxarifado Central & Suprimentos Industriais</p>
                    <p className="text-[11px] text-slate-500">Responsável Técnica: Giovana B. Germano</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">REQUISIÇÃO OFICIAL</div>
                  <div className="font-mono text-xl font-extrabold text-slate-950">
                    {selectedReqForPrint.code}
                  </div>
                  <div className="text-xs text-slate-600">Data: {formatDate(selectedReqForPrint.date)}</div>
                </div>
              </div>

              {/* Meta Data Box */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-300 bg-slate-50 p-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Setor / Departamento Destino:</span>
                  <p className="text-sm font-semibold text-slate-950">{selectedReqForPrint.sectorName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Solicitante:</span>
                  <p className="text-sm font-semibold text-slate-950">
                    {selectedReqForPrint.requesterName} ({selectedReqForPrint.requesterRole})
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Grau de Prioridade:</span>
                  <p className="font-semibold text-slate-900">{selectedReqForPrint.priority}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Status Operacional:</span>
                  <p className="font-semibold text-slate-900">{selectedReqForPrint.status}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">Finalidade / Aplicação Declarada:</span>
                  <p className="text-slate-800">{selectedReqForPrint.purpose}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Itens Requisitados
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold">
                      <th className="border border-slate-300 p-2 text-center w-12">#</th>
                      <th className="border border-slate-300 p-2 text-left">Código SKU</th>
                      <th className="border border-slate-300 p-2 text-left">Descrição do Material</th>
                      <th className="border border-slate-300 p-2 text-center w-20">Unidade</th>
                      <th className="border border-slate-300 p-2 text-center w-28">Qtd. Solicitada</th>
                      <th className="border border-slate-300 p-2 text-center w-28">Qtd. Entregue</th>
                      <th className="border border-slate-300 p-2 text-left">Conferência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReqForPrint.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-200">
                        <td className="border border-slate-300 p-2 text-center font-bold">{index + 1}</td>
                        <td className="border border-slate-300 p-2 font-mono">{item.materialCode}</td>
                        <td className="border border-slate-300 p-2 font-medium">{item.materialName}</td>
                        <td className="border border-slate-300 p-2 text-center">{item.unit}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold text-sm">
                          {item.quantityRequested}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-bold">
                          {item.quantityDelivered !== undefined ? item.quantityDelivered : '____'}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-400">[ &nbsp; ] Ok</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures Section */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-900">{selectedReqForPrint.requesterName}</p>
                  <p className="text-[11px] text-slate-500">Solicitante / Receptor</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-900">Gerência de Departamento</p>
                  <p className="text-[11px] text-slate-500">Autorização & Centro de Custo</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-900">Giovana B. Germano</p>
                  <p className="text-[11px] text-slate-500">Almoxarife / Responsável Técnica</p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500">
                Documento gerado automaticamente pelo Sistema de Controle de Estoque Empresarial em{' '}
                {new Date().toLocaleString('pt-BR')}. Válido para controle interno e auditoria.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA REQUISIÇÃO */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0e1b33] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Criar Nova Requisição de Materiais</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
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

            <form onSubmit={handleSubmitNew} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Setor Destino *</label>
                  <select
                    value={sectorId}
                    onChange={e => setSectorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.costCenter})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as RequisitionPriority)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nome do Solicitante *</label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={e => setRequesterName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={requesterRole}
                    onChange={e => setRequesterRole(e.target.value)}
                    placeholder="Ex: Supervisor Operacional"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Finalidade / Justificativa *</label>
                <textarea
                  rows={2}
                  required
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="Descreva o motivo da solicitação e onde os materiais serão aplicados..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Items List */}
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">Itens Requisitados</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar Outro Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <select
                          value={it.materialId}
                          onChange={e => handleItemMaterialChange(idx, e.target.value)}
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                        >
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.code} - {m.name} (Saldo: {m.currentQuantity} {m.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          required
                          value={it.quantityRequested}
                          onChange={e => handleItemQuantityChange(idx, Number(e.target.value))}
                          placeholder="Qtd"
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-bold text-center focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <span className="w-12 text-slate-400 font-bold text-[11px]">{it.unit}</span>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Gerando Requisição...' : 'Emitir Requisição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
