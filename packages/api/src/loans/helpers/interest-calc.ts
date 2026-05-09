// Cálculo de interés simple para el MVP. CLAUDE.md indica 5-10% como rango;
// usamos 7% anual prorrateado por días del término. Nota legal: estos valores
// son aproximación y deben revisarse con asesor antes de operar en producción.

const ANNUAL_INTEREST_RATE = 0.07;
const DAYS_IN_YEAR = 365;

export interface LoanAmounts {
  principal: number;
  interest: number;
  total: number;
}

export function calculateLoanAmounts(principal: number, termDays: number): LoanAmounts {
  const interest = principal * ANNUAL_INTEREST_RATE * (termDays / DAYS_IN_YEAR);
  // Redondeo a 2 decimales para alinearse con Decimal(10,2) del schema
  const interestRounded = Math.round(interest * 100) / 100;
  const total = Math.round((principal + interestRounded) * 100) / 100;
  return {
    principal,
    interest: interestRounded,
    total,
  };
}
