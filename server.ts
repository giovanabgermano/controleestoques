import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MATERIALS, INITIAL_SECTORS, INITIAL_MOVEMENTS, INITIAL_REQUISITIONS } from './src/data/initialData.ts';
import { Material, Sector, Movement, Requisition, StockAlert, StockKPIs } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State with persistent backing in session
let materials: Material[] = [...INITIAL_MATERIALS];
let sectors: Sector[] = [...INITIAL_SECTORS];
let movements: Movement[] = [...INITIAL_MOVEMENTS];
let requisitions: Requisition[] = [...INITIAL_REQUISITIONS];

// Helper to calculate Stock Alerts
function getStockAlerts(): StockAlert[] {
  const alerts: StockAlert[] = [];
  for (const m of materials) {
    if (m.currentQuantity <= m.minQuantity) {
      const isCritical = m.currentQuantity === 0;
      alerts.push({
        materialId: m.id,
        code: m.code,
        name: m.name,
        currentQuantity: m.currentQuantity,
        minQuantity: m.minQuantity,
        unit: m.unit,
        severity: isCritical ? 'critical' : 'warning',
        message: isCritical 
          ? `ESTOQUE ESGOTADO: ${m.name} atingiu quantidade zero (mínimo exigido: ${m.minQuantity} ${m.unit}). Reposição imediata necessária!`
          : `ESTOQUE BAIXO: ${m.name} está com apenas ${m.currentQuantity} ${m.unit} (mínimo de segurança: ${m.minQuantity} ${m.unit}).`,
        suggestedRestock: Math.max(0, m.maxQuantity - m.currentQuantity),
      });
    }
  }
  // Sort critical first
  return alerts.sort((a, b) => (a.severity === 'critical' ? -1 : 1));
}

// Helper to calculate KPIs
function getStockKPIs(): StockKPIs {
  const totalStockValue = materials.reduce((acc, m) => acc + (m.currentQuantity * m.unitCost), 0);
  const totalUnitsInStock = materials.reduce((acc, m) => acc + m.currentQuantity, 0);
  const outOfStockCount = materials.filter(m => m.currentQuantity === 0).length;
  const lowStockCount = materials.filter(m => m.currentQuantity > 0 && m.currentQuantity <= m.minQuantity).length;
  const excessStockCount = materials.filter(m => m.currentQuantity > m.maxQuantity).length;

  const entries = movements.filter(m => m.type === 'ENTRY');
  const exits = movements.filter(m => m.type === 'EXIT');

  const monthlyEntriesValue = entries.reduce((acc, m) => acc + (m.totalValue || 0), 0);
  const monthlyExitsValue = exits.reduce((acc, m) => acc + (m.totalValue || 0), 0);

  // Turnover rate: Total exits value / Average stock value
  const turnoverRate = totalStockValue > 0 ? Number(((monthlyExitsValue / totalStockValue) * 100).toFixed(1)) : 0;

  return {
    totalItems: materials.length,
    totalUnitsInStock,
    totalStockValue: Number(totalStockValue.toFixed(2)),
    outOfStockCount,
    lowStockCount,
    excessStockCount,
    turnoverRate,
    totalMovementsCount: movements.length,
    monthlyEntriesValue: Number(monthlyEntriesValue.toFixed(2)),
    monthlyExitsValue: Number(monthlyExitsValue.toFixed(2)),
  };
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health & Metadata
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'Sistema de Controle de Estoque Empresarial',
    technicalManager: 'Giovana B. Germano',
    timestamp: new Date().toISOString(),
  });
});

// KPIs & Alerts
app.get('/api/kpis', (req: Request, res: Response) => {
  res.json(getStockKPIs());
});

app.get('/api/alerts', (req: Request, res: Response) => {
  res.json(getStockAlerts());
});

// MATERIAIS
app.get('/api/materials', (req: Request, res: Response) => {
  const { search, category, status } = req.query;
  let filtered = [...materials];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.code.toLowerCase().includes(q) || 
      m.location?.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'ALL') {
    filtered = filtered.filter(m => m.category === category);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    if (status === 'out_of_stock') {
      filtered = filtered.filter(m => m.currentQuantity === 0);
    } else if (status === 'low') {
      filtered = filtered.filter(m => m.currentQuantity > 0 && m.currentQuantity <= m.minQuantity);
    } else if (status === 'excess') {
      filtered = filtered.filter(m => m.currentQuantity > m.maxQuantity);
    } else if (status === 'normal') {
      filtered = filtered.filter(m => m.currentQuantity > m.minQuantity && m.currentQuantity <= m.maxQuantity);
    }
  }

  res.json(filtered);
});

app.post('/api/materials', (req: Request, res: Response) => {
  const data = req.body;
  const newMaterial: Material = {
    id: `mat-${Date.now()}`,
    code: data.code || `MAT-${String(materials.length + 1).padStart(3, '0')}`,
    name: data.name,
    description: data.description || '',
    category: data.category || 'Geral',
    unit: data.unit || 'UN',
    currentQuantity: Number(data.currentQuantity || 0),
    minQuantity: Number(data.minQuantity || 0),
    maxQuantity: Number(data.maxQuantity || 100),
    unitCost: Number(data.unitCost || 0),
    location: data.location || 'Almoxarifado Central',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  materials.unshift(newMaterial);
  res.status(201).json(newMaterial);
});

app.put('/api/materials/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Material não encontrado' });
  }

  materials[index] = {
    ...materials[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  res.json(materials[index]);
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const hasMovements = movements.some(m => m.materialId === id);
  if (hasMovements) {
    return res.status(400).json({ 
      error: 'Não é possível excluir este material pois existem movimentações registradas para ele. Recomenda-se inativá-lo ou ajustar o saldo.' 
    });
  }

  materials = materials.filter(m => m.id !== id);
  res.json({ message: 'Material removido com sucesso' });
});

// SETORES
app.get('/api/sectors', (req: Request, res: Response) => {
  res.json(sectors);
});

app.post('/api/sectors', (req: Request, res: Response) => {
  const data = req.body;
  const newSector: Sector = {
    id: `sec-${Date.now()}`,
    code: data.code || `SEC-${String(sectors.length + 1).padStart(3, '0')}`,
    name: data.name,
    manager: data.manager || 'Não informado',
    costCenter: data.costCenter || 'CC-0000',
    email: data.email,
    phone: data.phone,
    location: data.location,
    active: true,
  };

  sectors.push(newSector);
  res.status(201).json(newSector);
});

app.put('/api/sectors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = sectors.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Setor não encontrado' });
  }

  sectors[index] = {
    ...sectors[index],
    ...req.body,
  };

  res.json(sectors[index]);
});

app.delete('/api/sectors/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  sectors = sectors.filter(s => s.id !== id);
  res.json({ message: 'Setor removido com sucesso' });
});

// MOVIMENTAÇÕES
app.get('/api/movements', (req: Request, res: Response) => {
  const { type, materialId, sectorId, startDate, endDate } = req.query;
  let filtered = [...movements];

  if (type && typeof type === 'string' && type !== 'ALL') {
    filtered = filtered.filter(m => m.type === type);
  }

  if (materialId && typeof materialId === 'string' && materialId !== 'ALL') {
    filtered = filtered.filter(m => m.materialId === materialId);
  }

  if (sectorId && typeof sectorId === 'string' && sectorId !== 'ALL') {
    filtered = filtered.filter(m => m.destinationSectorId === sectorId);
  }

  if (startDate && typeof startDate === 'string') {
    filtered = filtered.filter(m => m.date >= startDate);
  }

  if (endDate && typeof endDate === 'string') {
    filtered = filtered.filter(m => m.date <= endDate);
  }

  res.json(filtered);
});

app.post('/api/movements', (req: Request, res: Response) => {
  const data = req.body;
  const material = materials.find(m => m.id === data.materialId);

  if (!material) {
    return res.status(404).json({ error: 'Material selecionado não foi encontrado no cadastro.' });
  }

  const quantity = Number(data.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'A quantidade movimentada deve ser maior que zero.' });
  }

  // Validação de saldo para saída
  if (data.type === 'EXIT') {
    if (material.currentQuantity < quantity) {
      return res.status(400).json({
        error: `Saldo insuficiente em estoque. O estoque atual de "${material.name}" é de apenas ${material.currentQuantity} ${material.unit}.`
      });
    }
  }

  const unitCost = data.unitCost !== undefined ? Number(data.unitCost) : material.unitCost;
  const totalValue = Number((quantity * unitCost).toFixed(2));

  // Criar registro da movimentação
  const newMovement: Movement = {
    id: `mov-${Date.now()}`,
    type: data.type,
    materialId: material.id,
    materialCode: material.code,
    materialName: material.name,
    quantity,
    unit: material.unit,
    date: data.date || new Date().toISOString().split('T')[0],
    unitCost,
    totalValue,
    supplier: data.supplier,
    invoiceNumber: data.invoiceNumber,
    destinationSectorId: data.destinationSectorId,
    destinationSectorName: data.destinationSectorName,
    requester: data.requester,
    reason: data.reason,
    notes: data.notes,
    registeredBy: data.registeredBy || 'Giovana B. Germano (Responsável Técnica)',
    createdAt: new Date().toISOString(),
  };

  // Atualizar saldo do material atomicamente
  if (data.type === 'ENTRY') {
    material.currentQuantity += quantity;
    if (data.unitCost) {
      material.unitCost = Number(data.unitCost);
    }
  } else if (data.type === 'EXIT') {
    material.currentQuantity -= quantity;
  }
  material.updatedAt = new Date().toISOString();

  movements.unshift(newMovement);

  res.status(201).json({
    movement: newMovement,
    updatedMaterial: material,
    alerts: getStockAlerts(),
  });
});

// REQUISIÇÕES
app.get('/api/requisitions', (req: Request, res: Response) => {
  res.json(requisitions);
});

app.post('/api/requisitions', (req: Request, res: Response) => {
  const data = req.body;
  const newReq: Requisition = {
    id: `req-${Date.now()}`,
    code: `REQ-2026-${String(requisitions.length + 1).padStart(3, '0')}`,
    date: data.date || new Date().toISOString().split('T')[0],
    requesterName: data.requesterName,
    requesterRole: data.requesterRole || 'Colaborador',
    sectorId: data.sectorId,
    sectorName: data.sectorName,
    priority: data.priority || 'MEDIA',
    status: 'PENDENTE',
    purpose: data.purpose,
    items: data.items || [],
    notes: data.notes,
    warehouseClerk: 'Giovana B. Germano',
    createdAt: new Date().toISOString(),
  };

  requisitions.unshift(newReq);
  res.status(201).json(newReq);
});

app.put('/api/requisitions/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, deliverItems } = req.body;

  const reqIndex = requisitions.findIndex(r => r.id === id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Requisição não encontrada.' });
  }

  const targetReq = requisitions[reqIndex];
  targetReq.status = status;

  // Se for atendida e solicitado baixa no estoque automático:
  if (status === 'ATENDIDA' && deliverItems) {
    for (const item of targetReq.items) {
      const mat = materials.find(m => m.id === item.materialId);
      if (mat) {
        const qtyToDeliver = item.quantityRequested;
        if (mat.currentQuantity >= qtyToDeliver) {
          mat.currentQuantity -= qtyToDeliver;
          mat.updatedAt = new Date().toISOString();

          // Registrar saída automática
          movements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: 'EXIT',
            materialId: mat.id,
            materialCode: mat.code,
            materialName: mat.name,
            quantity: qtyToDeliver,
            unit: mat.unit,
            date: new Date().toISOString().split('T')[0],
            unitCost: mat.unitCost,
            totalValue: Number((qtyToDeliver * mat.unitCost).toFixed(2)),
            destinationSectorId: targetReq.sectorId,
            destinationSectorName: targetReq.sectorName,
            requester: targetReq.requesterName,
            reason: `Atendimento formal à Requisição ${targetReq.code}: ${targetReq.purpose}`,
            notes: `Baixa automática via requisição aprovada.`,
            registeredBy: 'Giovana B. Germano',
            createdAt: new Date().toISOString(),
          });

          item.quantityDelivered = qtyToDeliver;
        }
      }
    }
    targetReq.deliveredAt = new Date().toISOString();
  }

  res.json(targetReq);
});

// SCHEMA & DOCUMENTATION ENDPOINT
app.get('/api/database/schema', (req: Request, res: Response) => {
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    res.json({
      database: 'PostgreSQL / MySQL 8.0+',
      schemaSql: sqlContent,
      tables: ['materiais', 'setores', 'categorias', 'fornecedores', 'movimentacoes', 'requisicoes', 'requisicao_itens'],
      technicalManager: 'Giovana B. Germano',
    });
  } catch {
    res.json({
      database: 'PostgreSQL / MySQL 8.0+',
      schemaSql: '-- Consulte o arquivo /database/schema.sql no repositório.',
      tables: ['materiais', 'setores', 'categorias', 'fornecedores', 'movimentacoes', 'requisicoes', 'requisicao_itens'],
      technicalManager: 'Giovana B. Germano',
    });
  }
});

// Reset para dados de demonstração
app.post('/api/reset', (req: Request, res: Response) => {
  materials = [...INITIAL_MATERIALS];
  sectors = [...INITIAL_SECTORS];
  movements = [...INITIAL_MOVEMENTS];
  requisitions = [...INITIAL_REQUISITIONS];
  res.json({ message: 'Dados restaurados com sucesso para os valores padrão.' });
});

// -------------------------------------------------------------
// VITE INTEGRATION / STATIC SERVING
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Controle de Estoque] Servidor rodando na porta ${PORT}`);
    console.log(`Responsável Técnica: Giovana B. Germano`);
  });
}

start();
