export const INTEREST_RATES: Record<number, number> = {
  1: 3.75,
  2: 5.39,
  3: 6.72,
  4: 6.85,
  5: 7.57,
  6: 8.28,
  7: 8.99,
  8: 9.69,
  9: 10.38,
  10: 11.76,
  11: 11.78,
  12: 12.40,
};

export const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão de Crédito",
  debito: "Cartão de Débito",
  boleto: "Boleto",
  prazo: "Prazo",
};

export interface PaymentDisplayInfo {
  label: string;
  originalTotal: number;
  finalTotal: number;
  hasInterest: boolean;
  installments?: number;
  installmentValue?: number;
  rate?: number;
}

/**
 * Parse payment_method string and compute display values.
 * payment_method can be:
 *   "Cartão de Crédito 3x"
 *   "Pix"
 *   "Boleto 4x/15d"
 *   "Cartão 3x/Pix" (split)
 */
export function parsePaymentDisplay(paymentMethod: string, total: number): PaymentDisplayInfo {
  const isCreditCard = paymentMethod.toLowerCase().includes("cartão de crédito") || 
                        paymentMethod.toLowerCase().includes("cartao");
  
  // Extract installments from "Cartão de Crédito 3x" pattern
  const installmentMatch = paymentMethod.match(/(\d+)x/);
  const installments = installmentMatch ? parseInt(installmentMatch[1]) : undefined;

  if (isCreditCard && installments && INTEREST_RATES[installments]) {
    const rate = INTEREST_RATES[installments];
    const finalTotal = total * (1 + rate / 100);
    const installmentValue = finalTotal / installments;
    return {
      label: `Cartão de Crédito ${installments}x`,
      originalTotal: total,
      finalTotal,
      hasInterest: true,
      installments,
      installmentValue,
      rate,
    };
  }

  return {
    label: paymentMethod,
    originalTotal: total,
    finalTotal: total,
    hasInterest: false,
  };
}

/**
 * Parse split payment method string like "Cartão 3x/Pix"
 * Returns individual method names
 */
export function parseSplitMethods(paymentMethod: string): string[] {
  return paymentMethod.split("/").map(m => m.trim()).filter(Boolean);
}

export function isSplitPayment(paymentMethod: string): boolean {
  return paymentMethod.includes("/");
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}
