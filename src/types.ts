/**
 * Types and Interfaces for Sistema de Controle de Estoque
 * Responsável Técnica: Giovana B. Germano
 */

export type UnitOfMeasure = 'UN' | 'CX' | 'KG' | 'G' | 'M' | 'M2' | 'L' | 'ML' | 'PAR' | 'PCT' | 'ROLO';

export type StockStatus = 'normal' | 'low' | 'out_of_stock' | 'excess';

export type MovementType = 'ENTRY' | 'EXIT';

export type RequisitionPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type RequisitionStatus = 'PENDENTE' | 'APROVADA' | 'ATENDIDA' | 'CANCELADA';

export interface Material {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: UnitOfMeasure;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitCost: number;
  location: string; // Ex: Prateleira A-02, Corredor 3
  createdAt: string;
  updatedAt: string;
}

export interface Sector {
  id: string;
  code: string;
  name: string;
  manager: string;
  costCenter: string;
  email?: string;
  phone?: string;
  location?: string;
  active: boolean;
}

export interface Movement {
  id: string;
  type: MovementType;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unit: UnitOfMeasure;
  date: string; // YYYY-MM-DD
  unitCost?: number;
  totalValue?: number;
  
  // Detalhes de Entrada
  supplier?: string;
  invoiceNumber?: string;
  
  // Detalhes de Saída
  destinationSectorId?: string;
  destinationSectorName?: string;
  requester?: string;
  reason?: string;
  
  notes?: string;
  registeredBy: string;
  createdAt: string;
}

export interface RequisitionItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: UnitOfMeasure;
  quantityRequested: number;
  quantityDelivered?: number;
  notes?: string;
}

export interface Requisition {
  id: string;
  code: string; // REQ-2026-001
  date: string;
  requesterName: string;
  requesterRole: string;
  sectorId: string;
  sectorName: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  purpose: string;
  items: RequisitionItem[];
  notes?: string;
  warehouseClerk?: string;
  approvedBy?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface StockAlert {
  materialId: string;
  code: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  unit: UnitOfMeasure;
  severity: 'critical' | 'warning'; // critical: 0, warning: <= min
  message: string;
  suggestedRestock: number;
}

export interface StockKPIs {
  totalItems: number;
  totalUnitsInStock: number;
  totalStockValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  excessStockCount: number;
  turnoverRate: number; // Taxa de rotatividade
  totalMovementsCount: number;
  monthlyEntriesValue: number;
  monthlyExitsValue: number;
}
