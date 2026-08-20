import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function getLocalStorage(key) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parse a date string to a Date object without timezone issues.
 * Handles YYYY-MM-DD format strings by parsing them as local dates.
 * @param {string|Date} dateValue - The date string or Date object
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export function parseDateSafe(dateValue) {
  if (!dateValue) return null;
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Handle date-only strings (YYYY-MM-DD) without timezone issues
  if (typeof dateValue === 'string') {
    const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const year = parseInt(dateOnlyMatch[1], 10);
      const month = parseInt(dateOnlyMatch[2], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateOnlyMatch[3], 10);
      return new Date(year, month, day);
    }
  }
  
  // Fallback to standard Date parsing for other formats
  return new Date(dateValue);
}

/**
 * Return a Date whose LOCAL calendar day equals the source value's intended
 * calendar day. Date-only fields (invoice dates, bank-transaction posted
 * dates) are serialized by the BE as UTC-midnight ISO (e.g.
 * "2026-05-07T00:00:00.000Z"). Rendering that with a local-timezone formatter
 * shifts it a day west of UTC (07 → 06). This reads the UTC calendar
 * components (or the literal YYYY-MM-DD) so `format()` shows the right day in
 * any timezone.
 * @param {string|Date} value
 * @returns {Date|null}
 */
export function toCalendarDate(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Format a Date object to YYYY-MM-DD string without timezone issues
 * @param {Date} date - The Date object to format
 * @returns {string} - Formatted date string in YYYY-MM-DD format
 */
export function formatDateToISO(date) {
  if (!date || !(date instanceof Date)) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString) {
  const date = parseDateSafe(dateString);
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export const convertToCents = (dollarAmount) => {
  return Math.round(dollarAmount * 100);
};

// Converting cents back to dollars for display
export const convertToDollars = (centAmount) => {
  return (centAmount / 100).toFixed(2);
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {Object|string} options - Currency code string or options object
 * @param {string} [options.currency] - ISO 4217 currency code. REQUIRED to
 *   render the currency symbol; if omitted (or null/undefined), the
 *   function renders the bare number with no symbol. Callers should pass
 *   `useDisplayCurrency(override)` from `business-provider.jsx` rather
 *   than letting a stray default leak the wrong country's currency in.
 * @param {number} [options.decimals=2] - Number of decimal places
 * @param {boolean} [options.showSymbol=true] - Render currency symbol
 * @returns {string} - Formatted currency string
 *
 * Why no default currency: a hardcoded "CAD" here silently mis-rendered
 * AU/BD orgs as Canadian during the loading window. Forcing callers to
 * pass currency makes the bias loud and traceable.
 */
export function formatCurrency(amount, options = {}) {
  // Handle legacy string parameter for backward compatibility
  if (typeof options === 'string') {
    options = { currency: options };
  }

  const { currency, decimals = 2, showSymbol = true } = options;

  if (amount === null || amount === undefined) {
    // No amount + no currency → bare zero so the column doesn't render
    // a CAD-looking $0 for an AU customer mid-load.
    return currency && showSymbol ? formatAmount(0, currency, decimals) : '0.00';
  }

  // All monetary values are stored as integer cents — convert to dollars for display
  const num = (Number(amount) || 0) / 100;

  if (showSymbol && currency) {
    return formatAmount(num, currency, decimals);
  }
  // Either the caller asked for no symbol, or there's no currency to
  // render — emit a locale-formatted bare number.
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

function formatAmount(num, currency, decimals) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    // Unrecognized currency code → fall back to bare number rather than throw.
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }
}


// Form utils ============================== to merge with use form
/**
 * Check if a value is a plain object.
 * @param {*} item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deeply merges two values. For arrays, it merges each index.
 * If a key in the source is undefined, the target value is kept.
 *
 * @param {*} target - The target value.
 * @param {*} source - The source value.
 * @returns {*} - The merged value.
 */
export function deepMerge(target, source) {
  // Handle merging arrays
  if (Array.isArray(target) && Array.isArray(source)) {
    const maxLen = Math.max(target.length, source.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      if (i in target && i in source) {
        result[i] = deepMerge(target[i], source[i]);
      } else if (i in target) {
        result[i] = target[i];
      } else {
        result[i] = source[i];
      }
    }
    return result;
  }

  // Handle merging objects
  if (isObject(target) && isObject(source)) {
    const result = { ...target };
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (key in target) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  // For primitive values, use source if it's defined.
  return source !== undefined ? source : target;
}