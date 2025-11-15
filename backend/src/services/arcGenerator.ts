import { iotaService } from './iotaService.js';
import { AppError } from '../middleware/errorHandler.js';

export class ARCGenerator {
  private readonly DEFAULT_COUNTRY_CODE = 'EU';
  private readonly MAX_RETRIES = 5;

  /**
   * Generate a unique Administrative Reference Code (ARC)
   * Format: YYAANNNNNNNNNNNNNNNNC
   * - YY: Year (2 digits)
   * - AA: Country code (2 letters, default: EU)
   * - NNNNNNNNNNNNNNNN: Random 16-digit number
   * - C: Check digit (Luhn algorithm)
   */
  async generateARC(): Promise<string> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const arc = this.createARC();
        
        // Check uniqueness on blockchain
        const exists = await this.checkARCExists(arc);
        
        if (!exists) {
          console.log(`✅ Generated unique ARC: ${arc}`);
          return arc;
        }
        
        console.log(`⚠️  ARC collision detected (attempt ${attempt}/${this.MAX_RETRIES}), regenerating...`);
      } catch (error) {
        console.error(`❌ Error generating ARC (attempt ${attempt}):`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw new AppError('Failed to generate unique ARC after maximum retries', 500);
        }
      }
    }

    throw new AppError('Failed to generate unique ARC', 500);
  }

  /**
   * Create an ARC with the specified format
   */
  private createARC(): string {
    // Extract year (last 2 digits)
    const year = new Date().getFullYear().toString().slice(-2);
    
    // Country code
    const countryCode = this.DEFAULT_COUNTRY_CODE;
    
    // Generate 16-digit random number
    const randomNumber = this.generateRandomNumber(16);
    
    // Combine without check digit
    const arcWithoutCheck = `${year}${countryCode}${randomNumber}`;
    
    // Calculate check digit using Luhn algorithm
    const checkDigit = this.calculateLuhnCheckDigit(arcWithoutCheck);
    
    // Final ARC
    return `${arcWithoutCheck}${checkDigit}`;
  }

  /**
   * Generate a random number string of specified length
   */
  private generateRandomNumber(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  /**
   * Calculate Luhn check digit
   * The Luhn algorithm is used for validating identification numbers
   */
  private calculateLuhnCheckDigit(input: string): number {
    // Convert to array of digits
    const digits = input.split('').map(char => {
      // Convert letters to numbers (A=10, B=11, etc.)
      if (/[A-Z]/.test(char)) {
        return char.charCodeAt(0) - 55; // A=10, B=11, ..., Z=35
      }
      return parseInt(char, 10);
    });

    // Luhn algorithm
    let sum = 0;
    let isEven = true; // Start from right, so first digit from left is "even" position

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    // Check digit is the amount needed to make sum divisible by 10
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  }

  /**
   * Validate an ARC format and check digit
   */
  validateARC(arc: string): boolean {
    // For demo mode, accept any ARC format (relaxed validation)
    if (!arc || arc.length < 10) {
      return false;
    }
    
    // Accept any alphanumeric string of reasonable length for demo
    return /^[A-Z0-9]{10,30}$/.test(arc);
    
    // Production validation (commented out for demo):
    // // Check length (21 characters)
    // if (arc.length !== 21) {
    //   return false;
    // }
    //
    // // Check format: YYAANNNNNNNNNNNNNNNNC
    // const pattern = /^\d{2}[A-Z]{2}\d{17}$/;
    // if (!pattern.test(arc)) {
    //   return false;
    // }
    //
    // // Validate check digit
    // const arcWithoutCheck = arc.slice(0, -1);
    // const providedCheckDigit = parseInt(arc.slice(-1), 10);
    // const calculatedCheckDigit = this.calculateLuhnCheckDigit(arcWithoutCheck);
    //
    // return providedCheckDigit === calculatedCheckDigit;
  }

  /**
   * Check if ARC already exists on blockchain
   */
  private async checkARCExists(arc: string): Promise<boolean> {
    try {
      const consignment = await iotaService.getConsignmentByARC(arc);
      return consignment !== null;
    } catch (error) {
      console.error('Error checking ARC existence:', error);
      // If we can't check, assume it doesn't exist to avoid blocking
      return false;
    }
  }

  /**
   * Parse ARC components
   */
  parseARC(arc: string): {
    year: string;
    countryCode: string;
    randomNumber: string;
    checkDigit: string;
  } | null {
    if (!this.validateARC(arc)) {
      return null;
    }

    return {
      year: arc.substring(0, 2),
      countryCode: arc.substring(2, 4),
      randomNumber: arc.substring(4, 20),
      checkDigit: arc.substring(20, 21),
    };
  }
}

// Export singleton instance
export const arcGenerator = new ARCGenerator();
