/**
 * SEED (System of Exchange of Excise Data) Registry
 * Mock implementation of EU operator registry using IOTA Identity
 */

export interface SEEDOperator {
  walletAddress: string;
  seedNumber: string; // Derived from wallet address
  companyName: string;
  vatNumber: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  authorizedGoods: string[];
  operatorType: 'consignor' | 'consignee' | 'both';
}

// Mock SEED registry - in production, this would use IOTA Identity
const seedRegistry: Map<string, SEEDOperator> = new Map();

// Initialize with mock operators
function initializeMockOperators() {
  const operators: SEEDOperator[] = [
    {
      walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      seedNumber: 'IE00445790001',
      companyName: 'Dublin Old Brewery',
      vatNumber: 'IE445790001',
      country: 'Ireland',
      address: '34 Lansdowne Road, Ballsbridge',
      city: 'Dublin 4',
      postalCode: 'D04',
      authorizedGoods: ['Wine', 'Beer', 'Spirits', 'Tobacco', 'Energy'],
      operatorType: 'both',
    },
    {
      walletAddress: '0x7db01866e872de911ee8d7632a6b30452e97f6ef206504aa534577391e02606a',
      seedNumber: 'IE00445790002',
      companyName: 'Tesco Ireland Limited',
      vatNumber: 'IE445790002',
      country: 'Ireland',
      address: 'Gresham House, Marine Road',
      city: 'Dun Laoghaire, Co. Dublin',
      postalCode: 'A96 E0X0',
      authorizedGoods: ['Wine', 'Beer', 'Spirits', 'Tobacco', 'Energy'],
      operatorType: 'both',
    },
    {
      walletAddress: '0x5d3b4d49f8260a11a31fe73cda9a43a0f92f3e734d808a3481169aeb3cf6c54a',
      seedNumber: 'CZ00377062888',
      companyName: 'Pilsner Urquell Brewery',
      vatNumber: 'CZ377062888',
      country: 'Czech Republic',
      address: 'U Prazdroje 64/7',
      city: 'Plzeň',
      postalCode: '301 00',
      authorizedGoods: ['Beer', 'Wine', 'Spirits'],
      operatorType: 'both',
    },
    {
      walletAddress: '0x7080d6f152f38c5377001df35fe0e5c9d5a16f7579fcf322d843a5f40813a730',
      seedNumber: 'DE00098765432',
      companyName: 'Berlin Beverages GmbH',
      vatNumber: 'DE98765432109',
      country: 'Germany',
      address: '456 Hauptstraße',
      city: 'Berlin',
      postalCode: '10115',
      authorizedGoods: ['Wine', 'Beer', 'Spirits'],
      operatorType: 'both',
    },
    {
      walletAddress: '0x9545bcc34cc03a986892687715ef2849c0623e22c081a20c8ef2c1f44bd0ac03',
      seedNumber: 'IT00055544433',
      companyName: 'Milano Spirits Import SRL',
      vatNumber: 'IT55544433221',
      country: 'Italy',
      address: '789 Via Roma',
      city: 'Milano',
      postalCode: '20121',
      authorizedGoods: ['Wine', 'Spirits'],
      operatorType: 'consignee',
    },
  ];

  operators.forEach(op => {
    seedRegistry.set(op.walletAddress.toLowerCase(), op);
  });
}

// Initialize on module load
initializeMockOperators();

/**
 * Lookup operator by wallet address
 */
export function lookupOperator(walletAddress: string): SEEDOperator | null {
  return seedRegistry.get(walletAddress.toLowerCase()) || null;
}

/**
 * Generate SEED number from wallet address (mock implementation)
 * In production, this would be an IOTA Identity DID
 */
export function generateSeedNumber(walletAddress: string, country: string): string {
  // Use first 8 chars of address as unique identifier
  const uniqueId = walletAddress.slice(2, 10).toUpperCase();
  return `${country}000${uniqueId}`;
}

/**
 * Validate if operator is authorized for goods type
 */
export function isAuthorizedForGoods(walletAddress: string, goodsType: string): boolean {
  const operator = lookupOperator(walletAddress);
  if (!operator) return false;
  return operator.authorizedGoods.includes(goodsType);
}

/**
 * Get all registered operators
 */
export function getAllOperators(): SEEDOperator[] {
  return Array.from(seedRegistry.values());
}
