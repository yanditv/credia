'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyBucket } from '@/lib/dashboard/metrics';
import { formatUsdc } from '@/lib/format';

const COLOR = '#22c55e';

function formatDayShort(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'short' }).format(d);
}

interface TooltipPayloadEntry {
  payload: { date: string; count: number; amount: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-medium text-slate-200">{formatDayShort(item.date)}</p>
      <p className="mt-1 font-mono text-slate-400">
        {item.count} crédito{item.count !== 1 ? 's' : ''} · {formatUsdc(item.amount)}
      </p>
    </div>
  );
}

interface LoansLineChartProps {
  data: DailyBucket[];
}

export function LoansLineChart({ data }: LoansLineChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="loans-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayShort}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip cursor={{ stroke: '#475569', strokeWidth: 1 }} content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={COLOR}
            strokeWidth={2}
            fill="url(#loans-area)"
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
