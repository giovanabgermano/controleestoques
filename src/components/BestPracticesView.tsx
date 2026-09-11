import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Target, 
  Clock, 
  Boxes, 
  Trash2, 
  TrendingDown, 
  Calculator, 
  CheckCircle2, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const BestPracticesView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'minmax' | 'frequency' | 'organization' | 'waste'>('minmax');

  // Interactive Mini Calculator for Safety Stock / Reorder Point
  const [calcDailyDemand, setCalcDailyDemand] = useState<number>(10);
  const [calcLeadTimeDays, setCalcLeadTimeDays] = useState<number>(5);
  const [calcSafetyBuffer, setCalcSafetyBuffer] = useState<number>(15);

  const reorderPoint = (calcDailyDemand * calcLeadTimeDays) + calcSafetyBuffer;

  return (
    <div className="space-y-6" id="best-practices-view-container">
      {/* Header */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#0d1b33] p-6">
        <div className="flex items-center gap-2 text-amber-400">
          <BookOpen className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Manual Operacional de Almoxarifado</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Boas Práticas de Gestão e Controle de Estoque
        </h2>
        <p className="text-sm text-slate-300">
          Diretrizes técnicas e operacionais desenvolvidas por <strong>Giovana B. Germano</strong> para manter alta acuracidade de inventário, evitar rupturas de suprimentos e otimizar custos de armazenagem.
        </p>
      </div>

      {/* Navigation Pill Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'minmax', label: '1. Controle de Qtd. Mínima e Máxima', icon: Target },
          { id: 'frequency', label: '2. Frequência de Movimentações (Curva ABC)', icon: Clock },
          { id: 'organization', label: '3. Organização, Rastreabilidade & PEPS', icon: Boxes },
          { id: 'waste', label: '4. Prevenção de Desperdícios & Avarias', icon: TrendingDown },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Controle de Quantidade Mínima e Máxima */}
      {activeSection === 'minmax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2 text-sm text-slate-300">
              <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-400" />
                  Conceito de Estoque Mínimo (Ponto de Pedido)
                </h3>
                <p>
                  O <strong>Estoque Mínimo</strong> (também chamado de <em>Estoque de Segurança</em>) é a quantidade de reserva que protege a operação contra oscilações de consumo e atrasos na entrega dos fornecedores (Lead Time).
                </p>
                <div className="rounded-lg bg-slate-900/90 border border-slate-700/80 p-3 font-mono text-xs text-amber-300">
                  Ponto de Pedido (PP) = (Consumo Diário Médio × Tempo de Reposição em Dias) + Estoque de Segurança
                </div>
                <p>
                  Quando o saldo atual atinge ou fica abaixo deste valor, o sistema dispara o alerta visual na interface para que o comprador emita o pedido de compra imediatamente.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Estoque Máximo e Custo de Carregamento
                </h3>
                <p>
                  O <strong>Estoque Máximo</strong> representa o teto de armazenamento físico e financeiro. Manter volumes acima do limite máximo gera:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
                  <li>Capital de giro desnecessariamente imobilizado.</li>
                  <li>Risco elevado de perda por obsolescência e vencimento de validade.</li>
                  <li>Ocupação excessiva de área física nos galpões e prateleiras.</li>
                  <li>Aumento do custo com seguros e perdas patrimoniais.</li>
                </ul>
              </div>
            </div>

            {/* Interactive Calculator Box */}
            <div className="rounded-xl border border-amber-500/40 bg-[#101e38] p-5 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-amber-400">
                <Calculator className="h-5 w-5" />
                <h4 className="font-bold text-white text-sm">Simulador de Ponto de Pedido</h4>
              </div>
              <p className="text-xs text-slate-300">
                Calcule a quantidade mínima ideal para configurar no cadastro do material:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Consumo Médio Diário (un/dia):</label>
                  <input
                    type="number"
                    min="1"
                    value={calcDailyDemand}
                    onChange={e => setCalcDailyDemand(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prazo de Entrega do Fornecedor (Dias):</label>
                  <input
                    type="number"
                    min="1"
                    value={calcLeadTimeDays}
                    onChange={e => setCalcLeadTimeDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Margem de Segurança Adicional (un):</label>
                  <input
                    type="number"
                    min="0"
                    value={calcSafetyBuffer}
                    onChange={e => setCalcSafetyBuffer(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white font-bold"
                  />
                </div>

                <div className="rounded-lg bg-amber-500/20 border border-amber-500/50 p-3 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Quantidade Mínima Recomendada:</span>
                  <div className="mt-1 text-2xl font-black text-amber-400 font-mono">
                    {reorderPoint} unidades
                  </div>
                  <span className="text-[10px] text-slate-300">
                    Disparar reposição assim que o estoque chegar a {reorderPoint} un.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Frequência Adequada de Movimentações */}
      {activeSection === 'frequency' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Classificação ABC de Pareto
            </h3>
            <p>
              Nem todos os materiais possuem a mesma importância operacional e financeira. Aplique a Curva ABC:
            </p>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3">
                <span className="font-bold text-red-400">Classe A (Críticos / Alto Valor):</span>
                <p className="mt-1 text-slate-300">
                  Representam cerca de 20% dos itens físicos, mas concentram até 80% do valor financeiro. Requerem controle diário rigoroso, inventários rotativos quinzenais e lotes de compra fracionados.
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
                <span className="font-bold text-amber-400">Classe B (Importância Intermediária):</span>
                <p className="mt-1 text-slate-300">
                  Cerca de 30% dos itens e 15% do valor financeiro. Acompanhamento quinzenal ou mensal com reposições programadas.
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-3">
                <span className="font-bold text-blue-400">Classe C (Baixo Custo / Alto Volume):</span>
                <p className="mt-1 text-slate-300">
                  Cerca de 50% dos itens, mas apenas 5% do valor (parafusos, clipes, etc.). Podem ser comprados em volumes maiores para reduzir custos de frete.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Inventários Rotativos vs. Anuais
            </h3>
            <p>
              Para eliminar discrepâncias entre o estoque físico e o saldo virtual do sistema:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5" />
                <span><strong>Não espere pelo balanço de fim de ano:</strong> Realize contagens cíclicas diárias de 5 a 10 materiais. Ao final de cada mês, todo o almoxarifado terá sido checado sem paralisar a produção.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5" />
                <span><strong>Acuracidade de Inventário (Target: &gt; 98%):</strong> Compare a contagem cega com o saldo do banco de dados relacional. Diferenças devem ser auditadas imediatamente antes do fechamento.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5" />
                <span><strong>Registro em Tempo Real:</strong> Nenhuma peça deve sair do almoxarifado sem a respectiva baixa digital no sistema ou emissão de requisição assinada.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 3: Organização, Rastreabilidade & PEPS */}
      {activeSection === 'organization' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="h-5 w-5 text-amber-400" />
              Método PEPS / FIFO (Primeiro que Entra, Primeiro que Sai)
            </h3>
            <p>
              O método <strong>PEPS</strong> (Primeiro a Entrar, Primeiro a Sair) garante que os lotes mais antigos sejam expedidos primeiro aos setores.
            </p>
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1 text-xs">
              <span className="font-bold text-amber-400">Regra de Ouro da Armazenagem:</span>
              <p className="text-slate-300">
                Ao receber um lote novo de fornecedor, posicione-o <em>atrás</em> dos materiais que já estavam na prateleira. O operador sempre retira a frente, evitando vencimento de shelf-life.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              Endereçamento Físico e Rastreabilidade
            </h3>
            <p>
              Todo material deve ter sua localização unívoca cadastrada no sistema (ex: <code>Corredor 2 - Prateleira B1 - Caixa 04</code>).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li>Identificação visual com etiquetas contendo código SKU e código de barras legível.</li>
              <li>Delimitação de áreas de quarentena para itens aguardando laudo de qualidade.</li>
              <li>Almoxarifado seguro com controle de acesso restrito aos funcionários autorizados.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 4: Prevenção de Desperdícios & Avarias */}
      {activeSection === 'waste' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              Prevenção de Avarias e Deterioração
            </h3>
            <p>
              Mais de 5% das perdas em almoxarifados ocorrem por manuseio inadequado e armazenamento incorreto.
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5" />
                <span><strong>Controle de Empilhamento Máximo:</strong> Respeite o número de caixas indicado pelo fabricante para não esmagar embalagens inferiores.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5" />
                <span><strong>Proteção contra Umidade e Calor:</strong> Mantenha solventes, lubrificantes e papéis longe da incidência solar direta e em pallets suspensos a 10cm do solo.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5" />
                <span><strong>EPIs e Manuseio Seguro:</strong> Evite contaminações cruzadas utilizando luvas e ferramentas adequadas para cada classe química.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0c182d] p-5 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Metodologia 5S no Almoxarifado
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <strong className="text-amber-400">1. Seiri (Utilização):</strong> Descarte ou devolva itens obsoletos sem uso há mais de 180 dias.
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <strong className="text-amber-400">2. Seiton (Organização):</strong> "Um lugar para cada coisa, cada coisa em seu lugar".
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <strong className="text-amber-400">3. Seiso (Limpeza):</strong> Ambiente livre de poeira, graxa e vazamentos.
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <strong className="text-amber-400">4. Seiketsu (Padronização):</strong> Etiquetas e fluxos de entrada e saída claros.
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                <strong className="text-amber-400">5. Shitsuke (Disciplina):</strong> Auditorias frequentes e respeito aos procedimentos.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
