import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  error: unknown;
  onRetry?: () => void;
}

function getMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error desconocido';
}

export function ErrorState({ title = 'Error al cargar datos', error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-8 text-center">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <AlertCircle className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{getMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
