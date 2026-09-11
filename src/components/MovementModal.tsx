import React, { useState, useEffect } from 'react';
import { Material, Sector, MovementType, UnitOfMeasure } from '../types';
import { ArrowDownLeft, ArrowUpRight, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MovementType;
  materials: Material[];
  sectors: Sector[];
  preSelectedMaterial?: Material | null;
  onSubmitMovement: (movementData: any) => Promise<void>;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  type,
  materials,
  sectors,
  preSelectedMaterial,
  onSubmitMovement,
}) => {
  const [materialId, setMaterialId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [unitCost, setUnitCost] = useState<number | string>('');
  
  // Entrada
  const [supplier, setSupplier] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  
  // Saída
  const [destinationSectorId, setDestinationSectorId] = useState<string>('');
  const [requester, setRequester] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (preSelectedMaterial) {
      setMaterialId(preSelectedMaterial.id);
      setUnitCost(preSelectedMaterial.unitCost);
    } else if (materials.length > 0 && !materialId) {
      setMaterialId(materials[0].id);
      setUnitCost(materials[0].unitCost);
    }
  }, [preSelectedMaterial, materials]);

  useEffect(() => {
    if (sectors.length > 0 && !destinationSectorId) {
      setDestinationSectorId(sectors[0].id);
    }
  }, [sectors]);

  // Selected Material object
  const selectedMat = materials.find(m => m.id === materialId);

  // Update unit cost when material changes
  const handleMaterialChange = (newId: string) => {
    setMaterialId(newId);
    const mat = materials.find(m => m.id === newId);
    if (mat) {
      setUnitCost(mat.unitCost);
    }
  };

  if (!isOpen) return null;

  const isEntry = type === 'ENTRY';
  const numQty = Number(quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMat) {
      setError('Selecione um material válido.');
      return;
    }

    if (isNaN(numQty) || numQty <= 0) {
      setError('A quantidade deve ser um número maior que zero.');
      return;
    }

    if (!isEntry) {
      if (selectedMat.currentQuantity < numQty) {
        setError(`Saldo insuficiente! Estoque disponível de "${selectedMat.name}" é de apenas ${selectedMat.currentQuantity} ${selectedMat.unit}.`);
        return;
      }
      if (!destinationSectorId) {
        setError('Selecione o setor de destino da saída.');
        return;
      }
      if (!requester.trim()) {
        setError('Informe o solicitante da saída.');
        return;
      }
    } else {
      if (!supplier.trim()) {
        setError('Informe o nome do fornecedor da entrada.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const chosenSector = sectors.find(s => s.id === destinationSectorId);

      await onSubmitMovement({
        type,
        materialId: selectedMat.id,
        quantity: numQty,
        date,
        unitCost: Number(unitCost) || selectedMat.unitCost,
        supplier: isEntry ? supplier : undefined,
        invoiceNumber: isEntry ? invoiceNumber : undefined,
        destinationSectorId: !isEntry ? destinationSectorId : undefined,
        destinationSectorName: !isEntry && chosenSector ? chosenSector.name : undefined,
        requester: !isEntry ? requester : undefined,
        reason: !isEntry ? reason : undefined,
        notes,
        registeredBy: 'Giovana B. Germano (Responsável Técnica)',
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar movimentação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#0e1a2f] p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isEntry ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {isEntry ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEntry ? 'Registrar Entrada de Material' : 'Registrar Saída de Material'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEntry ? 'Recebimento de compra, fornecedor ou devolução' : 'Baixa de estoque, requisição ou consumo de setor'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-500/50 bg-red-950/40 p-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Material selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Selecione o Material *</label>
            <select
              value={materialId}
              onChange={e => handleMaterialChange(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} (Saldo: {m.currentQuantity} {m.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock info banner */}
          {selectedMat && (
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Saldo Atual em Estoque:</span>
                <p className="font-extrabold text-sm text-amber-400">
                  {selectedMat.currentQuantity} {selectedMat.unit}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Localização:</span>
                <p className="text-slate-300 font-medium">{selectedMat.location || 'Almoxarifado'}</p>
              </div>
            </div>
          )}

          {/* Quantity and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Quantidade Movimentada * ({selectedMat?.unit || 'UN'})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Ex: 10"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Data da Movimentação *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Unit Cost */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Custo Unitário (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={e => setUnitCost(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
            {numQty > 0 && Number(unitCost) > 0 && (
              <span className="mt-1 block text-[11px] text-amber-400">
                Valor Total desta operação: {formatCurrency(numQty * Number(unitCost))}
              </span>
            )}
          </div>

          {/* Type specific fields: ENTRY */}
          {isEntry ? (
            <div className="space-y-3 rounded-lg border border-emerald-900/40 bg-emerald-950/15 p-3">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ArrowDownLeft className="h-4 w-4" />
                Dados do Fornecedor & Recebimento
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">Fornecedor / Fabricante *</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    placeholder="Ex: Kalunga S/A"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">Nota Fiscal / Doc. Entrada</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    placeholder="Ex: NF-e 12948"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Type specific fields: EXIT */
            <div className="space-y-3 rounded-lg border border-blue-900/40 bg-blue-950/15 p-3">
              <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4" />
                Destino & Finalidade da Saída
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">Setor / Departamento Destino *</label>
                  <select
                    required
                    value={destinationSectorId}
                    onChange={e => setDestinationSectorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.costCenter})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-medium text-slate-300 mb-1">Colaborador Solicitante *</label>
                  <input
                    type="text"
                    required
                    value={requester}
                    onChange={e => setRequester(e.target.value)}
                    placeholder="Nome de quem retirou"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Motivo / Aplicação</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ex: Manutenção na esteira da Linha 2"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Observações Adicionais</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Número de lote, validade, condições do material..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-lg px-5 py-2 font-bold text-white shadow-md transition active:scale-95 disabled:opacity-50 ${
                isEntry
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isSubmitting
                ? 'Gravando Movimentação...'
                : isEntry
                ? 'Confirmar Entrada'
                : 'Confirmar Saída'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
