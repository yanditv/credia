'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkline } from './sparkline';
import type { DailyBucket } from '@/lib/dashboard/metrics';

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: number; // porcentaje (positivo o negativo)
  sparkline?: DailyBucket[];
  sparklineColor?: string;
  invertTrend?: boolean; // para métricas donde "subir" es malo (ej: mora)
}

export function KpiCard({
  label,
  value,
  hint,
  trend,
  sparkline,
  sparklineColor = '#22c55e',
  invertTrend = false,
}: KpiCardProps) {
  const showTrend = typeof trend === 'number' && trend !== 0;
  const isPositive = invertTrend ? trend! < 0 : trend! > 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          {showTrend ? (
            <div
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
                isPositive
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400',
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend!).toFixed(1)}%
            </div>
          ) : null}
        </div>

        <p className="font-mono text-3xl font-semibold tabular-nums text-slate-100">{value}</p>

        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}

        {sparkline && sparkline.length > 0 ? (
          <Sparkline data={sparkline} color={sparklineColor} height={36} />
        ) : null}
      </div>
    </Card>
  );
}
