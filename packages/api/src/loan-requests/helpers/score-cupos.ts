// Cupos máximos por rango de score, alineados con CLAUDE.md:
//   < 400      → no aprobado
//   400-599    → hasta $50 USDC
//   600-749    → hasta $150 USDC
//   750-1000   → hasta $300 USDC

export const MIN_SCORE_FOR_LOAN = 400;

export function getMaxAmountByScore(score: number): number {
  if (score < 400) return 0;
  if (score < 600) return 50;
  if (score < 750) return 150;
  return 300;
}

export const VALID_TERM_DAYS = [7, 15, 30] as const;
export type ValidTermDays = (typeof VALID_TERM_DAYS)[number];
