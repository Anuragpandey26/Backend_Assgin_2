/**
 * Dummy Currency Conversion Utility
 * Standardized exchange rates for offline use.
 */

const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 83.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52,
};

/**
 * Converts an amount from one currency to another using dummy rates.
 * @param {number} amount Amount to convert.
 * @param {string} from FROM currency code (e.g., 'USD').
 * @param {string} to TO currency code (e.g., 'INR').
 * @returns {number} Converted amount.
 */
export const convertCurrency = (amount, from = "USD", to = "USD") => {
  const fromRate = EXCHANGE_RATES[from.toUpperCase()] || 1.0;
  const toRate = EXCHANGE_RATES[to.toUpperCase()] || 1.0;

  if (from === to) return amount;

  // Convert to USD first (base), then to target
  const amountInUsd = amount / fromRate;
  return Number((amountInUsd * toRate).toFixed(2));
};

export const getSupportedCurrencies = () => Object.keys(EXCHANGE_RATES);
