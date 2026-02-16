/**
 * Unit conversion utilities for cholesterol values
 * mg/dL to mmol/L conversion factor: divide by 38.67
 * mmol/L to mg/dL conversion factor: multiply by 38.67
 */

export function mgdLToMmolL(mgdL: number): number {
  return parseFloat((mgdL / 38.67).toFixed(2));
}

export function mmolLToMgdL(mmolL: number): number {
  return Math.round(mmolL * 38.67);
}

/**
 * Convert cholesterol value based on unit preference
 */
export function convertCholesterol(
  value: string,
  fromUnit: "mgdL" | "mmolL",
  toUnit: "mgdL" | "mmolL"
): string {
  if (!value || value.trim() === "") return value;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;

  if (fromUnit === toUnit) return value;

  if (fromUnit === "mgdL" && toUnit === "mmolL") {
    return mgdLToMmolL(numValue).toString();
  }

  if (fromUnit === "mmolL" && toUnit === "mgdL") {
    return mmolLToMgdL(numValue).toString();
  }

  return value;
}

/**
 * Get display label for unit
 */
export function getUnitLabel(unit: "mgdL" | "mmolL"): string {
  return unit === "mgdL" ? "mg/dL" : "mmol/L";
}
