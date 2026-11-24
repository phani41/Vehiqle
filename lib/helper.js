// Reusable formatting and calculation utilities

// Shared singletons for Intl.NumberFormat to avoid slow re-instantiation on every render
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

export const formatCurrency = (amount) => currencyFormatter.format(amount || 0);

export const formatNumber = (num) => {
  const parsed = typeof num === "string" ? parseFloat(num) : num;
  return numberFormatter.format(isNaN(parsed) ? 0 : parsed);
};

/**
 * Standardize and serialize car data across actions and components
 */
export const serializeCarData = (car, wishlisted = false) => {
  if (!car) return null;
  return {
    ...car,
    images: car.image || [],
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString ? car.createdAt.toISOString() : car.createdAt,
    updatedAt: car.updatedAt?.toISOString ? car.updatedAt.toISOString() : car.updatedAt,
    wishlisted,
  };
};

export const serializedCarData = serializeCarData;

/**
 * Reusable loan / EMI calculation utility
 * Calculates monthly EMI, total interest, and total payment.
 */
export const calculateEMI = (principal, downPayment, rate, years) => {
  const safePrincipal = Math.max(0, parseFloat(principal) || 0);
  const safeDown = Math.max(0, Math.min(parseFloat(downPayment) || 0, safePrincipal));
  const loanPrincipal = safePrincipal - safeDown;

  if (loanPrincipal <= 0) {
    return null;
  }

  const safeRate = Math.max(0.01, parseFloat(rate) || 5);
  const safeYears = Math.max(1, parseInt(years, 10) || 1);
  const monthlyRate = safeRate / 100 / 12;
  const months = safeYears * 12;

  const factor = Math.pow(1 + monthlyRate, months);
  const emi = (loanPrincipal * monthlyRate * factor) / (factor - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - loanPrincipal;

  return {
    emi: emi.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalPayment: totalPayment.toFixed(2),
    loanPrincipal: loanPrincipal.toFixed(2),
    downPayment: safeDown.toFixed(2),
  };
};
