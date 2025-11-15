/**
 * Irish Excise Duty Calculator for Beer
 * Based on Irish Revenue regulations
 */

/**
 * Calculate Irish beer excise duty
 * 
 * Formula: Rate per hl × hectolitres × ABV%
 * Rate for ABV > 2.8%: €22.55 per hl
 * Rate for ABV ≤ 2.8%: €11.27 per hl
 * 
 * @param quantityLiters - Volume in liters
 * @param alcoholPercentage - ABV (e.g., 4.4, 4.5, 2.5)
 * @returns Excise duty in euros
 */
export function calculateIrishBeerDuty(
  quantityLiters: number,
  alcoholPercentage: number
): number {
  // Convert liters to hectolitres (1 hl = 100 liters)
  const hectolitres = quantityLiters / 100;

  // Determine rate based on ABV threshold
  const ratePerHl = alcoholPercentage <= 2.8 ? 11.27 : 22.55;

  // Calculate duty: Rate × hectolitres × ABV
  const duty = ratePerHl * hectolitres * alcoholPercentage;

  // Round to 2 decimal places
  return Math.round(duty * 100) / 100;
}

/**
 * Format excise duty amount for display
 */
export function formatExciseDuty(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

/**
 * Get detailed duty calculation breakdown
 */
export function getExciseDutyBreakdown(
  quantityLiters: number,
  alcoholPercentage: number
): {
  volume: number;
  volumeUnit: string;
  hectolitres: number;
  abv: number;
  rate: number;
  rateDescription: string;
  duty: number;
  dutyFormatted: string;
} {
  const hectolitres = quantityLiters / 100;
  const rate = alcoholPercentage <= 2.8 ? 11.27 : 22.55;
  const duty = calculateIrishBeerDuty(quantityLiters, alcoholPercentage);

  return {
    volume: quantityLiters,
    volumeUnit: 'litres',
    hectolitres: Math.round(hectolitres * 100) / 100,
    abv: alcoholPercentage,
    rate,
    rateDescription: `€${rate.toFixed(2)} per hl (ABV ${alcoholPercentage <= 2.8 ? '≤' : '>'} 2.8%)`,
    duty,
    dutyFormatted: formatExciseDuty(duty),
  };
}
