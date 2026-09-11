# Arquitetura e Documentação do Banco de Dados Relacional
**Sistema de Controle de Estoque Empresarial**  
**Responsável Técnica:** Giovana B. Germano  

---

## 1. Visão Geral da Arquitetura
O banco de dados foi modelado seguindo a 3ª Forma Normal (3NF), garantindo integridade referencial, prevenção de redundâncias e alta velocidade em consultas de inventário, relatórios de posição e rastreabilidade total de movimentações.

### Diagrama Entidade-Relacionamento (Conceitual)

```
+----------------+          +-----------------------+          +-------------------+
|    SETORES     |          |     MOVIMENTACOES     |          |    FORNECEDORES   |
+----------------+          +-----------------------+          +-------------------+
| id (PK)        |<---+     | id (PK)               |     +--->| id (PK)           |
| codigo (UQ)    |    |     | tipo (ENTRY/EXIT)     |     |    | cnpj_cpf (UQ)     |
| nome           |    |     | material_id (FK) -----+--+  |    | razao_social      |
| responsavel    |    |     | quantidade            |  |  |    | contato / email   |
| centro_custo   |    |     | data_movimentacao     |  |  |    +-------------------+
+-------+--------+    |     | fornecedor_nome       |--+--+
        |             |     | numero_nf             |  |
        | 1           |     | setor_destino_id (FK)-+  |
        |             |     | solicitante / motivo  |  |
        | N           |     | registrado_por        |  |
+-------v--------+    |     +-----------------------+  |
|  REQUISICOES   |    |                                |
+----------------+    |                                |
| id (PK)        |    |                                |
| codigo (UQ)    |    |                                |
| setor_id (FK) -+----+                                |
| solicitante    |                                     |
| prioridade     |                                     |
| status         |                                     |
+-------+--------+                                     |
        | 1                                            |
        |                                              |
        | N                                            |
+-------v---------------+                              |
| REQUISICAO_ITENS      |                              |
+-----------------------+                              |
| id (PK)               |                              |
| requisicao_id (FK)    |                              |
| material_id (FK) -----+------------------------------+
| qtd_solicitada        |                              |
| qtd_atendida          |                              |
+-----------------------+                              |
                                                       |
                                            +----------v--------+
                                            |     MATERIAIS     |
                                            +-------------------+
                                            | id (PK)           |
                                            | codigo (UQ)       |
                                            | nome              |
                                            | unidade_medida    |
                                            | quantidade_atual  |
                                            | quantidade_minima |
                                            | quantidade_maxima |
                                            | custo_unitario    |
                                            +-------------------+
```

---

## 2. Tabelas Principais

1. **`materiais`**: Cadastro de itens com controle de saldo atual, estoque de segurança (mínimo), limite de capacidade (máximo), custo médio e localização física no almoxarifado.
2. **`setores`**: Centros de custo e departamentos consumidores de materiais (Produção, TI, Manutenção, etc.).
3. **`movimentacoes`**: Razão de estoque imutável (ledger). Cada registro de ENTRADA (compra, devolução) ou SAÍDA (consumo, requisição) é auditável e armazena executor, motivo, NF ou centro de custo.
4. **`requisicoes`**: Pedidos formais de materiais abertos pelos setores, com aprovação gerencial e impressão de formulário assinado.
5. **`requisicao_itens`**: Detalhamento dos itens solicitados por requisição.

---

## 3. Instruções de Instalação e Setup

### Opção A: PostgreSQL
1. Certifique-se de ter o PostgreSQL 14+ instalado.
2. Crie o banco de dados:
   ```bash
   createdb estoque_empresarial
   ```
3. Execute o script DDL:
   ```bash
   psql -d estoque_empresarial -f database/schema.sql
   ```
4. O trigger `trg_atualizar_saldo` garantirá que cada `INSERT` em `movimentacoes` ajuste atomicamente a coluna `quantidade_atual` da tabela `materiais`.

### Opção B: MySQL 8.0+
1. Crie a base de dados com codificação UTF-8:
   ```sql
   CREATE DATABASE estoque_empresarial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE estoque_empresarial;
   ```
2. Importe o arquivo `database/schema.sql` via MySQL Workbench ou terminal:
   ```bash
   mysql -u root -p estoque_empresarial < database/schema.sql
   ```

---

## 4. Indicadores e Consultas Analíticas Prontas

### Consulta de Itens com Estoque Baixo / Crítico:
```sql
SELECT 
    codigo, 
    nome, 
    quantidade_atual, 
    quantidade_minima, 
    unidade_medida,
    (quantidade_minima - quantidade_atual) AS quantidade_repor
FROM materiais
WHERE quantidade_atual <= quantidade_minima
ORDER BY quantidade_atual ASC;
```

### Consulta de Posição de Estoque Valorizada:
```sql
SELECT 
    categoria,
    COUNT(id) AS total_itens,
    SUM(quantidade_atual * custo_unitario) AS valor_total_estoque
FROM materiais
GROUP BY categoria
ORDER BY valor_total_estoque DESC;
```
