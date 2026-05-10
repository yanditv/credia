'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// 6 barras horizontales con stagger animation. Pesos según CLAUDE.md:
//   paymentHistory       30% (peso máximo)
//   constantSales        25%
//   commercialReputation 15%
//   businessAge          10%
//   verifiedDocs         10%
//   usageBehavior        10%

export interface ScoreBreakdownData {
  constantSales?: number;
  paymentHistory?: number;
  commercialReputation?: number;
  businessAge?: number;
  verifiedDocs?: number;
  usageBehavior?: number;
}

interface Component {
  key: keyof Required<ScoreBreakdownData>;
  label: string;
  weight: number;
  // El backend devuelve cada componente en escala 0-100 (Cesar's PR #12).
  // El score total se compone con sus pesos. Mostramos el valor 0-100 directo
  // y el peso al lado para contexto.
}

const COMPONENTS: Component[] = [
  { key: 'paymentHistory', label: 'Historial de pagos', weight: 30 },
  { key: 'constantSales', label: 'Ventas constantes', weight: 25 },
  { key: 'commercialReputation', label: 'Reputación comercial', weight: 15 },
  { key: 'businessAge', label: 'Antigüedad del negocio', weight: 10 },
  { key: 'verifiedDocs', label: 'Documentación verificada', weight: 10 },
  { key: 'usageBehavior', label: 'Comportamiento de uso', weight: 10 },
];

function valueColor(value: number): string {
  if (value >= 75) return 'bg-green-500';
  if (value >= 50) return 'bg-emerald-500';
  if (value >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

interface ScoreBreakdownProps {
  data: ScoreBreakdownData;
  className?: string;
}

export function ScoreBreakdown({ data, className }: ScoreBreakdownProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={cn('space-y-3', className)}>
      {COMPONENTS.map((c, i) => {
        const raw = data[c.key];
        const value = typeof raw === 'number' ? Math.max(0, Math.min(raw, 100)) : 0;
        const width = visible ? `${value}%` : '0%';
        const delay = `${i * 80}ms`;

        return (
          <div key={c.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span>{c.label}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                  {c.weight}%
                </span>
              </div>
              <span className="font-mono tabular-nums text-slate-200">{value}/100</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800/60">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-700 ease-out',
                  valueColor(value),
                )}
                style={{ width, transitionDelay: delay }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
