import React, { useState, useEffect, useCallback } from 'react';
import { Material, Sector, Movement, Requisition, StockAlert, StockKPIs, RequisitionStatus } from './types';
import { Header } from './components/Header';
import { StockNotificationBanner } from './components/StockNotificationBanner';
import { DashboardView } from './components/DashboardView';
import { MaterialsView } from './components/MaterialsView';
import { SectorsView } from './components/SectorsView';
import { MovementsView } from './components/MovementsView';
import { RequisitionsView } from './components/RequisitionsView';
import { StockReportView } from './components/StockReportView';
import { BestPracticesView } from './components/BestPracticesView';
import { DatabaseDocsView } from './components/DatabaseDocsView';
import { MovementModal } from './components/MovementModal';
import { Footer } from './components/Footer';
import { CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [kpis, setKpis] = useState<StockKPIs>({
    totalStockValue: 0,
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    turnoverRate: 0,
    overStockCount: 0,
    totalMovementsMonth: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Movement Modal State
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalType, setMovementModalType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [preSelectedMaterial, setPreSelectedMaterial] = useState<Material | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    try {
      const [matRes, secRes, movRes, reqRes, kpiRes, aleRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/sectors'),
        fetch('/api/movements'),
        fetch('/api/requisitions'),
        fetch('/api/kpis'),
        fetch('/api/alerts'),
      ]);

      if (matRes.ok) setMaterials(await matRes.json());
      if (secRes.ok) setSectors(await secRes.json());
      if (movRes.ok) setMovements(await movRes.json());
      if (reqRes.ok) setRequisitions(await reqRes.json());
      if (kpiRes.ok) setKpis(await kpiRes.json());
      if (aleRes.ok) setAlerts(await aleRes.json());
    } catch (error) {
      console.error('Erro ao buscar dados do servidor:', error);
      showToast('Erro ao comunicar com a API do servidor.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Movement Handlers
  const handleOpenEntryModal = (mat?: Material) => {
    setMovementModalType('ENTRY');
    setPreSelectedMaterial(mat || null);
    setIsMovementModalOpen(true);
  };

  const handleOpenExitModal = (mat?: Material) => {
    setMovementModalType('EXIT');
    setPreSelectedMaterial(mat || null);
    setIsMovementModalOpen(true);
  };

  const handleSubmitMovement = async (movementData: any) => {
    const res = await fetch('/api/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movementData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao registrar movimentação');
    }

    showToast(
      movementData.type === 'ENTRY'
        ? `Entrada de ${movementData.quantity} unidades registrada com sucesso!`
        : `Saída de ${movementData.quantity} unidades baixada do estoque com sucesso!`
    );
    await fetchAllData();
  };

  // Material Handlers
  const handleSaveMaterial = async (materialData: Partial<Material>) => {
    const isEdit = Boolean(materialData.id);
    const url = isEdit ? `/api/materials/${materialData.id}` : '/api/materials';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao salvar material');
    }

    showToast(isEdit ? 'Material atualizado com sucesso!' : 'Novo material cadastrado com sucesso!');
    await fetchAllData();
  };

  const handleDeleteMaterial = async (id: string) => {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir material');
    }

    showToast('Material removido do cadastro.', 'info');
    await fetchAllData();
  };

  // Sector Handlers
  const handleSaveSector = async (sectorData: Partial<Sector>) => {
    const isEdit = Boolean(sectorData.id);
    const url = isEdit ? `/api/sectors/${sectorData.id}` : '/api/sectors';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectorData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao salvar setor');
    }

    showToast(isEdit ? 'Setor atualizado com sucesso!' : 'Novo setor cadastrado com sucesso!');
    await fetchAllData();
  };

  const handleDeleteSector = async (id: string) => {
    const res = await fetch(`/api/sectors/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir setor');
    }

    showToast('Setor removido com sucesso.', 'info');
    await fetchAllData();
  };

  // Requisition Handlers
  const handleSaveRequisition = async (reqData: Partial<Requisition>) => {
    const res = await fetch('/api/requisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar requisição');
    }

    showToast('Requisição gerada com sucesso! Código emitido para acompanhamento.');
    await fetchAllData();
  };

  const handleUpdateRequisitionStatus = async (
    id: string,
    status: RequisitionStatus,
    deliverItems?: boolean
  ) => {
    const res = await fetch(`/api/requisitions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, deliverItems }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar status da requisição');
    }

    showToast(
      deliverItems
        ? 'Requisição atendida e itens baixados automaticamente do estoque!'
        : `Status da requisição atualizado para ${status}.`
    );
    await fetchAllData();
  };

  // Reset Demo Data
  const handleResetData = async () => {
    if (!window.confirm('Deseja restaurar os dados de exemplo padrão do almoxarifado?')) {
      return;
    }
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Dados restaurados para o padrão de demonstração!', 'info');
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Main Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        alerts={alerts}
        materials={materials}
        onOpenEntryModal={() => handleOpenEntryModal()}
        onOpenExitModal={() => handleOpenExitModal()}
        onOpenNewRequisition={() => setCurrentTab('requisitions')}
        onQuickRestock={mat => handleOpenEntryModal(mat)}
        onResetData={handleResetData}
      />

      {/* Main View Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
            <p className="text-sm text-slate-400">Carregando dados do controle de estoque...</p>
          </div>
        ) : (
          <>
            {/* Visual Stock Notification Banner - Displayed when stock <= minQuantity */}
            <StockNotificationBanner
              alerts={alerts}
              materials={materials}
              onQuickRestock={mat => handleOpenEntryModal(mat)}
            />

            {/* Tab Views */}
            {currentTab === 'dashboard' && (
              <DashboardView
                kpis={kpis}
                alerts={alerts}
                materials={materials}
                movements={movements}
                sectors={sectors}
                onOpenEntryModal={() => handleOpenEntryModal()}
                onOpenExitModal={() => handleOpenExitModal()}
                onOpenNewMaterialModal={() => setCurrentTab('materials')}
                onOpenNewRequisitionModal={() => setCurrentTab('requisitions')}
                onQuickRestock={mat => handleOpenEntryModal(mat)}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'materials' && (
              <MaterialsView
                materials={materials}
                onSaveMaterial={handleSaveMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onQuickEntry={mat => handleOpenEntryModal(mat)}
                onQuickExit={mat => handleOpenExitModal(mat)}
              />
            )}

            {currentTab === 'sectors' && (
              <SectorsView
                sectors={sectors}
                movements={movements}
                onSaveSector={handleSaveSector}
                onDeleteSector={handleDeleteSector}
              />
            )}

            {currentTab === 'movements' && (
              <MovementsView
                movements={movements}
                materials={materials}
                sectors={sectors}
                onOpenEntryModal={() => handleOpenEntryModal()}
                onOpenExitModal={() => handleOpenExitModal()}
              />
            )}

            {currentTab === 'requisitions' && (
              <RequisitionsView
                requisitions={requisitions}
                materials={materials}
                sectors={sectors}
                onSaveRequisition={handleSaveRequisition}
                onUpdateStatus={handleUpdateRequisitionStatus}
              />
            )}

            {currentTab === 'reports' && (
              <StockReportView
                materials={materials}
                sectors={sectors}
                movements={movements}
                kpis={kpis}
              />
            )}

            {currentTab === 'best-practices' && <BestPracticesView />}

            {currentTab === 'database' && <DatabaseDocsView />}
          </>
        )}
      </main>

      {/* Movement Modal (Entry / Exit) */}
      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setPreSelectedMaterial(null);
        }}
        type={movementModalType}
        materials={materials}
        sectors={sectors}
        preSelectedMaterial={preSelectedMaterial}
        onSubmitMovement={handleSubmitMovement}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div
          id="system-toast-notification"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200 ${
            toast.type === 'error'
              ? 'border-red-500/50 bg-red-950/90 text-red-200'
              : toast.type === 'info'
              ? 'border-blue-500/50 bg-blue-950/90 text-blue-200'
              : 'border-emerald-500/50 bg-[#0a2318]/95 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* System Footer with Technical Responsible */}
      <Footer onNavigateToTab={setCurrentTab} />
    </div>
  );
}
