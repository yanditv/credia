'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { DailyBucket } from '@/lib/dashboard/metrics';

// Mini sparkline para mostrar trend dentro de KPI cards. Sin ejes, sin labels —
// solo el área coloreada. Recharts ResponsiveContainer ajusta a la altura del
// contenedor padre.

interface SparklineProps {
  data: DailyBucket[];
  field?: 'amount' | 'count';
  color?: string;
  height?: number;
}

export function Sparkline({
  data,
  field = 'amount',
  color = '#22c55e',
  height = 40,
}: SparklineProps) {
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={field}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#', '')})`}
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
