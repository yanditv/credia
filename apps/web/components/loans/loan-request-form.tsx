'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ApiError } from '@/lib/api';
import { loanRequestsApi, type CreateLoanRequestInput } from '@/lib/api/loan-requests';

interface LoanRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LoanRequestForm({ onSuccess, onCancel }: LoanRequestFormProps) {
  const qc = useQueryClient();
  const [requestedAmount, setRequestedAmount] = useState('100');
  const [termDays, setTermDays] = useState<7 | 15 | 30>(30);
  const [purpose, setPurpose] = useState('');

  const mutation = useMutation({
    mutationFn: (input: CreateLoanRequestInput) => loanRequestsApi.create(input),
    onSuccess: () => {
      toast.success('Solicitud enviada — pendiente de aprobación');
      qc.invalidateQueries({ queryKey: ['loan-requests'] });
      onSuccess?.();
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Error al enviar solicitud';
      toast.error(msg);
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate({
      requestedAmount,
      termDays,
      purpose: purpose.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="amount">Monto (USDC)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="1"
          value={requestedAmount}
          onChange={(e) => setRequestedAmount(e.target.value)}
          placeholder="100.00"
          required
          disabled={mutation.isPending}
        />
        <p className="text-xs text-slate-500">
          Tu cupo se calcula automáticamente según tu score
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="term">Plazo</Label>
        <Select
          id="term"
          value={termDays}
          onChange={(e) => setTermDays(Number(e.target.value) as 7 | 15 | 30)}
          disabled={mutation.isPending}
        >
          <option value={7}>7 días</option>
          <option value={15}>15 días</option>
          <option value={30}>30 días</option>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="purpose">Propósito del crédito</Label>
        <Input
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Ampliar inventario para feria de fin de mes"
          minLength={10}
          maxLength={280}
          required
          disabled={mutation.isPending}
        />
        <p className="text-xs text-slate-500">{purpose.length}/280 caracteres</p>
      </div>

      <div className="flex items-center gap-2 md:col-span-2">
        <Button type="submit" loading={mutation.isPending}>
          Enviar solicitud
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={mutation.isPending}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
