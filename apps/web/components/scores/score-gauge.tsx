'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/api-types';

// SVG circular gauge animado para mostrar el score (0-1000).
// Color dinámico por riskLevel + número monospace al centro + label de cupo.
// Animación con requestAnimationFrame para llenado progresivo al montar.

const RISK_CONFIG: Record<
  RiskLevel,
  { stroke: string; glow: string; label: string; cupo: string }
> = {
  HIGH: { stroke: '#ef4444', glow: 'rgba(239,68,68,0.3)', label: 'Alto riesgo', cupo: 'No aprobado' },
  MEDIUM: {
    stroke: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    label: 'Riesgo medio',
    cupo: 'hasta $50 USDC',
  },
  ACCEPTABLE: {
    stroke: '#22c55e',
    glow: 'rgba(34,197,94,0.3)',
    label: 'Riesgo aceptable',
    cupo: 'hasta $150 USDC',
  },
  LOW: {
    stroke: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    label: 'Riesgo bajo',
    cupo: 'hasta $300 USDC',
  },
};

const SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_FRACTION = 0.75; // 270deg arc (3/4)
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRACTION;
const ANIMATION_MS = 1100;

interface ScoreGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  className?: string;
}

export function ScoreGauge({ score, riskLevel, className }: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;
    function step(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      startRef.current = null;
    };
  }, [score]);

  const config = RISK_CONFIG[riskLevel];
  const fraction = Math.max(0, Math.min(score / 1000, 1));
  const dashOffset = ARC_LENGTH * (1 - fraction);

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-[135deg]"
        style={{ filter: `drop-shadow(0 0 12px ${config.glow})` }}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={config.stroke}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: `stroke-dashoffset ${ANIMATION_MS}ms cubic-bezier(0.16,1,0.3,1)`,
          }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-mono text-5xl font-bold tabular-nums text-slate-100"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {displayed}
        </span>
        <span className="text-xs uppercase tracking-wider text-slate-500">/ 1000</span>
        <span
          className="mt-1 text-sm font-medium"
          style={{ color: config.stroke }}
        >
          {config.label}
        </span>
        <span className="mt-0.5 text-[11px] text-slate-500">{config.cupo}</span>
      </div>
    </div>
  );
}
