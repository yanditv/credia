import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'amber' | 'green' | 'red' | 'blue' | 'slate';

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-700/50 text-slate-300 border-slate-600',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  slate: 'bg-slate-700 text-slate-200 border-slate-600',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
