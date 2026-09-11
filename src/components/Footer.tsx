import React from 'react';
import { ShieldCheck, Database, Boxes, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateToTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToTab }) => {
  return (
    <footer id="main-footer" className="mt-16 border-t border-slate-800 bg-[#060c18] py-8 text-xs text-slate-400 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand & Technical Lead */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-bold text-white text-sm">Controle de Estoque Empresarial</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-amber-400 font-mono">v2.4 LTS</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Responsável Técnica do Sistema:</span>
            <strong className="text-amber-400 font-semibold">Giovana B. Germano</strong>
          </div>
          <p className="text-[11px] text-slate-500">
            Engenharia Full-Stack especializada em Sistemas de Gestão e Operações Logísticas
          </p>
        </div>

        {/* System Specs & Links */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => onNavigateToTab('best-practices')}
            className="text-slate-400 hover:text-amber-400 transition"
          >
            Boas Práticas de Gestão
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={() => onNavigateToTab('database')}
            className="text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
          >
            <Database className="h-3.5 w-3.5 text-amber-400" />
            Esquema Relacional SQL
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={() => onNavigateToTab('reports')}
            className="text-slate-400 hover:text-amber-400 transition"
          >
            Relatórios Físico-Financeiros
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl border-t border-slate-900 px-4 pt-4 text-center text-[11px] text-slate-500">
        Desenvolvido com arquitetura moderna, escalável e segura. Pronto para implantação em ambiente corporativo.
      </div>
    </footer>
  );
};
