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
 * Extract installment info from the parent venda payment_method for a given split method.
 * E.g., vendaPaymentMethod="Pix/Cartão 8x", splitMethod="cartao" → 8
 * E.g., vendaPaymentMethod="Cartão de Crédito 5x", splitMethod="Cartão de Crédito 5x" → 5
 */
export function extractInstallmentsForSplit(vendaPaymentMethod: string, splitMethod: string): number | undefined {
  const splitKey = splitMethod.toLowerCase();
  const isCard = splitKey.includes("cartao") || splitKey.includes("cartão") || splitKey.includes("crédito") || splitKey.includes("credit");
  if (!isCard) return undefined;

  // Try to find installments from the split method itself first
  const directMatch = splitMethod.match(/(\d+)x/);
  if (directMatch) return parseInt(directMatch[1]);

  // Otherwise extract from the parent venda payment_method
  // Split by "/" and find the card segment
  const segments = vendaPaymentMethod.split("/");
  for (const seg of segments) {
    const segLower = seg.toLowerCase().trim();
    if (segLower.includes("cartao") || segLower.includes("cartão") || segLower.includes("crédito")) {
      const match = seg.match(/(\d+)x/);
      if (match) return parseInt(match[1]);
    }
  }

  // Try full string match
  const fullMatch = vendaPaymentMethod.match(/(\d+)x/);
  if (fullMatch) return parseInt(fullMatch[1]);

  return undefined;
}

/**
 * Parse a split payment with context from the parent venda.
 * The split amount may already include interest, so we reverse-calculate the original.
 */
export function parseSplitPaymentDisplay(
  splitMethod: string,
  splitAmount: number,
  vendaPaymentMethod: string
): PaymentDisplayInfo {
  const installments = extractInstallmentsForSplit(vendaPaymentMethod, splitMethod);

  if (installments && INTEREST_RATES[installments]) {
    const rate = INTEREST_RATES[installments];
    // splitAmount already includes interest, reverse to find original
    const originalTotal = splitAmount / (1 + rate / 100);
    const installmentValue = splitAmount / installments;
    return {
      label: `Cartão de Crédito ${installments}x`,
      originalTotal,
      finalTotal: splitAmount,
      hasInterest: true,
      installments,
      installmentValue,
      rate,
    };
  }

  return {
    label: splitMethod,
    originalTotal: splitAmount,
    finalTotal: splitAmount,
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
