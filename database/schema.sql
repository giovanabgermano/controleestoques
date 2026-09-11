-- ==============================================================================
-- SISTEMA DE CONTROLE DE ESTOQUE EMPRESARIAL
-- Arquitetura e Esquema de Banco de Dados Relacional (PostgreSQL / MySQL)
-- Responsável Técnica: Giovana B. Germano
-- Data: 2026
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

-- 2. TABELA DE CATEGORIAS DE MATERIAIS
CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(60) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. TABELA DE MATERIAIS
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

-- 4. TABELA DE FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
    id VARCHAR(36) PRIMARY KEY,
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(120),
    email VARCHAR(120),
    telefone VARCHAR(30),
    cidade VARCHAR(80),
    estado VARCHAR(2),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE MOVIMENTAÇÕES DE ESTOQUE (ENTRADAS E SAÍDAS)
CREATE TABLE IF NOT EXISTS movimentacoes (
    id VARCHAR(36) PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRY', 'EXIT')),
    material_id VARCHAR(36) NOT NULL,
    quantidade NUMERIC(12, 2) NOT NULL CHECK (quantidade > 0),
    unidade_medida VARCHAR(10) NOT NULL,
    data_movimentacao DATE NOT NULL,
    custo_unitario NUMERIC(12, 2) DEFAULT 0.00,
    valor_total NUMERIC(12, 2) DEFAULT 0.00,
    
    -- Campos específicos de Entrada:
    fornecedor_nome VARCHAR(150),
    numero_nf VARCHAR(50),
    
    -- Campos específicos de Saída:
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

-- 6. TABELA DE REQUISIÇÕES DE MATERIAIS
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

-- 7. TABELA DE ITENS DA REQUISIÇÃO
CREATE TABLE IF NOT EXISTS requisicao_itens (
    id VARCHAR(36) PRIMARY KEY,
    requisicao_id VARCHAR(36) NOT NULL,
    material_id VARCHAR(36) NOT NULL,
    quantidade_solicitada NUMERIC(12, 2) NOT NULL CHECK (quantidade_solicitada > 0),
    quantidade_atendida NUMERIC(12, 2) DEFAULT 0.00 CHECK (quantidade_atendida >= 0),
    observacoes TEXT,
    CONSTRAINT fk_item_requisicao FOREIGN KEY (requisicao_id) 
        REFERENCES requisicoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_material FOREIGN KEY (material_id) 
        REFERENCES materiais(id) ON DELETE RESTRICT
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE E BUSCA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_materiais_codigo ON materiais(codigo);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON materiais(categoria);
CREATE INDEX IF NOT EXISTS idx_materiais_qtd_atual ON materiais(quantidade_atual);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_material ON movimentacoes(material_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_setor ON movimentacoes(setor_destino_id);
CREATE INDEX IF NOT EXISTS idx_requisicoes_status ON requisicoes(status);
CREATE INDEX IF NOT EXISTS idx_requisicoes_data ON requisicoes(data_requisicao);

-- ==============================================================================
-- TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE SALDO EM ESTOQUE (PostgreSQL)
-- ==============================================================================
CREATE OR REPLACE FUNCTION fn_atualizar_saldo_estoque()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'ENTRY' THEN
        UPDATE materiais
        SET quantidade_atual = quantidade_atual + NEW.quantidade,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.material_id;
    ELSIF NEW.tipo = 'EXIT' THEN
        -- Validação de saldo disponível
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
EXECUTE FUNCTION fn_atualizar_saldo_estoque();
