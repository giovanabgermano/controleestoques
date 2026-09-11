import React, { useState } from 'react';
import { Database, Copy, Check, Download, Server, Terminal, ShieldCheck, Code2, Layers } from 'lucide-react';

export const DatabaseDocsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'setup'>('architecture');

  const sqlCode = `-- ==============================================================================
-- SISTEMA DE CONTROLE DE ESTOQUE EMPRESARIAL
-- Arquitetura e Esquema de Banco de Dados Relacional (PostgreSQL / MySQL)
-- Responsável Técnica: Giovana B. Germano
-- ==============================================================================

-- 1. TABELA DE SETORES / DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS setores (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    responsavel VARCHAR(100) NOT NULL,
    centro_custo VARCHAR(30) NOT NULL,
    email VARCHAR(120),
    telefone VARCHAR(30),
    localizacao VARCHAR(150),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE MATERIAIS
CREATE TABLE IF NOT EXISTS materiais (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(60) NOT NULL,
    unidade_medida VARCHAR(10) NOT NULL,
    quantidade_atual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantidade_minima NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quantidade_maxima NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    custo_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    localizacao VARCHAR(100),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_qtd_minima CHECK (quantidade_minima >= 0),
    CONSTRAINT chk_qtd_maxima CHECK (quantidade_maxima >= quantidade_minima),
    CONSTRAINT chk_qtd_atual CHECK (quantidade_atual >= 0)
);

-- 3. TABELA DE MOVIMENTAÇÕES DE ESTOQUE (ENTRADAS E SAÍDAS)
CREATE TABLE IF NOT EXISTS movimentacoes (
    id VARCHAR(36) PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRY', 'EXIT')),
    material_id VARCHAR(36) NOT NULL,
    quantidade NUMERIC(12, 2) NOT NULL CHECK (quantidade > 0),
    unidade_medida VARCHAR(10) NOT NULL,
    data_movimentacao DATE NOT NULL,
    custo_unitario NUMERIC(12, 2) DEFAULT 0.00,
    valor_total NUMERIC(12, 2) DEFAULT 0.00,
    fornecedor_nome VARCHAR(150),
    numero_nf VARCHAR(50),
    setor_destino_id VARCHAR(36),
    solicitante VARCHAR(100),
    motivo TEXT,
    observacoes TEXT,
    registrado_por VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_material FOREIGN KEY (material_id) 
        REFERENCES materiais(id) ON DELETE RESTRICT,
    CONSTRAINT fk_movimentacao_setor FOREIGN KEY (setor_destino_id) 
        REFERENCES setores(id) ON DELETE SET NULL
);

-- 4. TABELA DE REQUISIÇÕES DE MATERIAIS
CREATE TABLE IF NOT EXISTS requisicoes (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    data_requisicao DATE NOT NULL,
    solicitante_nome VARCHAR(100) NOT NULL,
    solicitante_cargo VARCHAR(80),
    setor_id VARCHAR(36) NOT NULL,
    prioridade VARCHAR(15) NOT NULL CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDENTE', 'APROVADA', 'ATENDIDA', 'CANCELADA')),
    finalidade TEXT NOT NULL,
    observacoes TEXT,
    almoxarife VARCHAR(100),
    aprovado_por VARCHAR(100),
    data_atendimento TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requisicao_setor FOREIGN KEY (setor_id) 
        REFERENCES setores(id) ON DELETE RESTRICT
);

-- 5. TABELA DE ITENS DA REQUISIÇÃO
CREATE TABLE IF NOT EXISTS requisicao_itens (
    id VARCHAR(36) PRIMARY KEY,
    requisicao_id VARCHAR(36) NOT NULL,
    material_id VARCHAR(36) NOT NULL,
    quantidade_solicitada NUMERIC(12, 2) NOT NULL CHECK (quantidade_solicitada > 0),
    quantidade_atendida NUMERIC(12, 2) DEFAULT 0.00,
    observacoes TEXT,
    CONSTRAINT fk_item_requisicao FOREIGN KEY (requisicao_id) 
        REFERENCES requisicoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_material FOREIGN KEY (material_id) 
        REFERENCES materiais(id) ON DELETE RESTRICT
);

-- 6. TRIGGER DE ATUALIZAÇÃO ATÔMICA DE SALDO (PostgreSQL)
CREATE OR REPLACE FUNCTION fn_atualizar_saldo_estoque()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'ENTRY' THEN
        UPDATE materiais
        SET quantidade_atual = quantidade_atual + NEW.quantidade,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.material_id;
    ELSIF NEW.tipo = 'EXIT' THEN
        IF (SELECT quantidade_atual FROM materiais WHERE id = NEW.material_id) < NEW.quantidade THEN
            RAISE EXCEPTION 'Saldo insuficiente em estoque para a saída do material %', NEW.material_id;
        END IF;
        UPDATE materiais
        SET quantidade_atual = quantidade_atual - NEW.quantidade,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.material_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualizar_saldo ON movimentacoes;
CREATE TRIGGER trg_atualizar_saldo
AFTER INSERT ON movimentacoes
FOR EACH ROW
EXECUTE FUNCTION fn_atualizar_saldo_estoque();`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlCode], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_controle_estoque.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="database-docs-container">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-[#0d1b33] p-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <Database className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Engenharia de Dados Relacional</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Arquitetura de Banco de Dados & Scripts DDL
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Compatível com <strong>PostgreSQL 14+</strong> e <strong>MySQL 8.0+</strong>. Modelagem na 3ª Forma Normal com integridade referencial estrita e triggers atômicos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-amber-400" />}
            {copied ? 'Copiado!' : 'Copiar Script SQL'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
          >
            <Download className="h-4 w-4" />
            Baixar schema.sql
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'architecture'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Diagrama Entidade-Relacionamento (ERD)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schema')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'schema'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Script DDL Completo (SQL)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'setup'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Guia de Instalação & Setup
        </button>
      </div>

      {/* TAB 1: Diagrama & Tabelas */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Visual ERD ASCII */}
          <div className="rounded-xl border border-slate-800 bg-[#081020] p-5 shadow-inner">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
              Diagrama Relacional Conceitual (Chaves Primárias & Estrangeiras)
            </h4>
            <pre className="overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#050b14] p-4 rounded-lg border border-slate-900">
{`+-----------------------+          +------------------------------------+
|        SETORES        |          |           MOVIMENTACOES            |
+-----------------------+          +------------------------------------+
| PK  id                |<---+     | PK  id                             |
| UQ  codigo            |    |     |     tipo (ENTRY / EXIT)            |
|     nome              |    |     | FK  material_id ----------------+  |
|     responsavel       |    |     |     quantidade                     |
|     centro_custo      |    |     |     data_movimentacao              |
+-----------+-----------+    |     |     fornecedor_nome (Entry)        |
            |                |     |     numero_nf (Entry)              |
            | 1              |     | FK  setor_destino_id (Exit) -------+  |
            |                |     |     solicitante / motivo (Exit)    |
            | N              |     |     registrado_por                 |
+-----------v-----------+    |     +------------------------------------+
|      REQUISICOES      |    |                                          |
+-----------------------+    |                                          |
| PK  id                |    |                                          |
| UQ  codigo            |    |                                          |
| FK  setor_id ---------+----+                                          |
|     solicitante_nome  |                                               |
|     prioridade        |                                               |
|     status            |                                               |
+-----------+-----------+                                               |
            | 1                                                         |
            |                                                           |
            | N                                                         |
+-----------v-----------+                                               |
|   REQUISICAO_ITENS    |                                               |
+-----------------------+                                               |
| PK  id                |                                               |
| FK  requisicao_id     |                                               |
| FK  material_id ------+-----------------------------------------------+
|     qtd_solicitada    |                                               |
|     qtd_atendida      |                                               |
+-----------------------+                                               |
                                                                        |
                                                     +------------------v--+
                                                     |      MATERIAIS      |
                                                     +---------------------+
                                                     | PK  id              |
                                                     | UQ  codigo          |
                                                     |     nome            |
                                                     |     categoria       |
                                                     |     unidade_medida  |
                                                     |     quantidade_atual|
                                                     |     qtd_minima      |
                                                     |     qtd_maxima      |
                                                     |     custo_unitario  |
                                                     +---------------------+`}
            </pre>
          </div>

          {/* Cards das Tabelas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-2">
              <span className="font-mono font-bold text-amber-400">1. materiais</span>
              <p className="text-slate-300">
                Armazena os itens de consumo e imobilizado, com restrições CHECK para garantir saldos não negativos e faixas seguras de quantidade mínima e máxima.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-2">
              <span className="font-mono font-bold text-amber-400">2. setores</span>
              <p className="text-slate-300">
                Cadastro dos departamentos e centros de custo solicitantes. Permite apuração de despesas por setor e alocação de custos contábeis.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-2">
              <span className="font-mono font-bold text-amber-400">3. movimentacoes</span>
              <p className="text-slate-300">
                Ledger imutável de entradas e saídas. Possui gatilho (trigger) de banco que recalcula e atualiza o saldo na tabela de materiais atomicamente.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-2">
              <span className="font-mono font-bold text-amber-400">4. requisicoes</span>
              <p className="text-slate-300">
                Formalização eletrônica de pedidos de material com controle de status (Pendente, Aprovada, Atendida, Cancelada) e aprovação de gerência.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-2">
              <span className="font-mono font-bold text-amber-400">5. requisicao_itens</span>
              <p className="text-slate-300">
                Itens e quantidades vinculados à requisição com chave estrangeira ON DELETE CASCADE garantindo integridade e consistência.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-4 space-y-2">
              <span className="font-mono font-bold text-emerald-400">6. Índices & Triggers</span>
              <p className="text-slate-300">
                Índices B-Tree criados em chaves de busca frequente (código, data, setor, tipo) garantindo tempo de resposta sub-milissegundo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Script SQL */}
      {activeTab === 'schema' && (
        <div className="relative rounded-xl border border-slate-800 bg-[#081020] p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="font-mono text-xs text-slate-400">/database/schema.sql (Pronto para Execução)</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
            >
              {copied ? 'Copiado!' : 'Copiar todo o SQL'}
            </button>
          </div>
          <pre className="overflow-x-auto max-h-[500px] font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
            {sqlCode}
          </pre>
        </div>
      )}

      {/* TAB 3: Guia de Setup */}
      {activeTab === 'setup' && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-400" />
              Opção 1: Configuração em PostgreSQL
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Instale o PostgreSQL 14 ou superior no servidor.
              </li>
              <li>
                Crie a base de dados:
                <pre className="mt-1 rounded bg-slate-900 p-2 font-mono text-amber-300">
                  createdb estoque_empresarial
                </pre>
              </li>
              <li>
                Execute o script de migração DDL:
                <pre className="mt-1 rounded bg-slate-900 p-2 font-mono text-amber-300">
                  psql -U postgres -d estoque_empresarial -f database/schema.sql
                </pre>
              </li>
              <li>
                Configure a string de conexão no arquivo <code>.env</code>:
                <pre className="mt-1 rounded bg-slate-900 p-2 font-mono text-amber-300">
                  DATABASE_URL="postgresql://postgres:senha@localhost:5432/estoque_empresarial"
                </pre>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              Opção 2: Configuração em MySQL 8.0+
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                No terminal MySQL ou Workbench:
                <pre className="mt-1 rounded bg-slate-900 p-2 font-mono text-blue-300">
                  CREATE DATABASE estoque_empresarial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
                </pre>
              </li>
              <li>
                Importe o arquivo DDL:
                <pre className="mt-1 rounded bg-slate-900 p-2 font-mono text-blue-300">
                  mysql -u root -p estoque_empresarial &lt; database/schema.sql
                </pre>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Garantia de Integridade e Auditoria:</span>
              <p className="mt-0.5 text-slate-300">
                A aplicação valida todos os limites no cliente e no servidor Express antes de gravar as transações, garantindo que o saldo nunca fique negativo e os registros históricos sejam mantidos para auditoria fiscal.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
