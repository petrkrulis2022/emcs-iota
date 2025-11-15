/**
 * IOTA Identity Mock Service
 * Simulates IOTA Identity DID resolution for EMCS operators
 * In production, this would use @iota/identity SDK
 */

export interface IOTAIdentityDID {
  did: string; // Decentralized Identifier
  walletAddress: string;
  verifiableCredentials: {
    seedNumber: string;
    companyName: string;
    vatNumber: string;
    country: string;
    countryCode: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
    phone: string;
    contactPerson?: string;
    authorizedGoods: string[];
    licenseNumber: string;
    issuedBy: string; // National tax authority
    issuedAt: string;
    expiresAt: string;
  };
  domainLinkage?: {
    domain: string;
    verified: boolean;
  };
}

// Mock IOTA Identity registry
const identityRegistry: Map<string, IOTAIdentityDID> = new Map();

// Initialize mock identities
function initializeMockIdentities() {
  const identities: IOTAIdentityDID[] = [
    {
      did: 'did:iota:ebfeb1f712ebc6f1c276e12ec21',
      walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      verifiableCredentials: {
        seedNumber: 'IE00445790001',
        companyName: 'Dublin Old Brewery',
        vatNumber: 'IE445790001',
        country: 'Ireland',
        countryCode: 'IE',
        address: '34 Lansdowne Road, Ballsbridge',
        city: 'Dublin 4',
        postalCode: 'D04',
        email: 'info@dublinoldbrewery.ie',
        phone: '+353 1 234 5678',
        contactPerson: 'Patrick O\'Brien',
        authorizedGoods: ['Wine', 'Beer', 'Spirits', 'Tobacco', 'Energy'],
        licenseNumber: 'IE-EXCISE-2024-445790',
        issuedBy: 'Revenue Commissioners (Ireland)',
        issuedAt: '2024-01-01T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
      },
      domainLinkage: {
        domain: 'dublinoldbrewery.ie',
        verified: true,
      },
    },
    {
      did: 'did:iota:7db01866e872de911ee8d7632a6b',
      walletAddress: '0x7db01866e872de911ee8d7632a6b30452e97f6ef206504aa534577391e02606a',
      verifiableCredentials: {
        seedNumber: 'IE00445790002',
        companyName: 'Tesco Ireland Limited',
        vatNumber: 'IE445790002',
        country: 'Ireland',
        countryCode: 'IE',
        address: 'Gresham House, Marine Road',
        city: 'Dun Laoghaire, Co. Dublin',
        postalCode: 'A96 E0X0',
        email: 'corporate@tesco.ie',
        phone: '+353 1 280 1122',
        contactPerson: 'Corporate Affairs',
        authorizedGoods: ['Wine', 'Beer', 'Spirits', 'Tobacco', 'Energy'],
        licenseNumber: 'IE-EXCISE-1997-445790',
        issuedBy: 'Revenue Commissioners (Ireland)',
        issuedAt: '1997-05-15T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
      },
      domainLinkage: {
        domain: 'tesco.ie',
        verified: true,
      },
    },
    {
      did: 'did:iota:9876543210fedcba9876543210fe',
      walletAddress: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      verifiableCredentials: {
        seedNumber: 'IT00444555666',
        companyName: 'Milano Bevande SpA',
        vatNumber: 'IT44455566677',
        country: 'Italy',
        countryCode: 'IT',
        address: 'Via Commercio 78',
        city: 'Milano',
        postalCode: '20100',
        email: 'info@milano-bevande.it',
        phone: '+39 02 1234 5678',
        contactPerson: 'Marco Rossi',
        authorizedGoods: ['Wine', 'Beer', 'Spirits'],
        licenseNumber: 'IT-EXCISE-2024-042',
        issuedBy: 'Agenzia delle Dogane e dei Monopoli (Italy)',
        issuedAt: '2024-02-15T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
      },
      domainLinkage: {
        domain: 'milano-bevande.it',
        verified: true,
      },
    },
    {
      did: 'did:iota:5d3b4d49f8260a11a31fe73cda9a',
      walletAddress: '0x5d3b4d49f8260a11a31fe73cda9a43a0f92f3e734d808a3481169aeb3cf6c54a',
      verifiableCredentials: {
        seedNumber: 'CZ00377062888',
        companyName: 'Pilsner Urquell Brewery',
        vatNumber: 'CZ377062888',
        country: 'Czech Republic',
        countryCode: 'CZ',
        address: 'U Prazdroje 64/7',
        city: 'Plzeň',
        postalCode: '301 00',
        email: 'reservations@asahibeer.cz',
        phone: '+420 377 062 888',
        contactPerson: 'Visitor Center',
        authorizedGoods: ['Beer', 'Wine', 'Spirits'],
        licenseNumber: 'CZ-EXCISE-1842-377062',
        issuedBy: 'Finanční správa České republiky',
        issuedAt: '1842-10-05T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
      },
      domainLinkage: {
        domain: 'prazdrojvisit.cz',
        verified: true,
      },
    },
    {
      did: 'did:iota:abcdef1234567890abcdef123456',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      verifiableCredentials: {
        seedNumber: 'CZ00987654321',
        companyName: 'Praha Wine Import s.r.o.',
        vatNumber: 'CZ98765432109',
        country: 'Czech Republic',
        countryCode: 'CZ',
        address: 'Vinohradská 123',
        city: 'Praha',
        postalCode: '10000',
        email: 'import@praha-wine.cz',
        phone: '+420 222 333 444',
        contactPerson: 'Petr Novák',
        authorizedGoods: ['Wine', 'Spirits'],
        licenseNumber: 'CZ-EXCISE-2024-089',
        issuedBy: 'Finanční správa České republiky',
        issuedAt: '2024-03-01T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
      },
      domainLinkage: {
        domain: 'praha-wine.cz',
        verified: true,
      },
    },
    {
      did: 'did:iota:fedcba0987654321fedcba098765',
      walletAddress: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      verifiableCredentials: {
        seedNumber: 'AT00999888777',
        companyName: 'Wien Beer Import GmbH',
        vatNumber: 'AT99988877766',
        country: 'Austria',
        countryCode: 'AT',
        address: 'Bierstraße 45',
        city: 'Wien',
        postalCode: '1020',
        email: 'office@wien-beer.at',
        phone: '+43 1 234 5678',
        contactPerson: 'Hans Müller',
        authorizedGoods: ['Beer', 'Wine'],
        licenseNumber: 'AT-EXCISE-2024-123',
        issuedBy: 'Bundesministerium für Finanzen (Austria)',
        issuedAt: '2024-01-15T00:00:00Z',
        expiresAt: '2025-12-31T23:59:59Z',
      },
      domainLinkage: {
        domain: 'wien-beer.at',
        verified: true,
      },
    },
  ];

  identities.forEach((identity) => {
    identityRegistry.set(identity.walletAddress.toLowerCase(), identity);
  });
}

// Initialize on module load
initializeMockIdentities();

/**
 * Resolve IOTA Identity DID from wallet address
 * Simulates: https://docs.iota.org/developer/iota-identity/getting-started/universal-resolver
 */
export async function resolveIdentity(walletAddress: string): Promise<IOTAIdentityDID | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const identity = identityRegistry.get(walletAddress.toLowerCase());
  return identity || null;
}

/**
 * Verify domain linkage for an identity
 * Simulates: https://docs.iota.org/developer/iota-identity/how-tos/domain-linkage/create-and-verify
 */
export async function verifyDomainLinkage(did: string, domain: string): Promise<boolean> {
  // Simulate verification delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Find identity by DID
  for (const identity of identityRegistry.values()) {
    if (identity.did === did) {
      return identity.domainLinkage?.domain === domain && identity.domainLinkage.verified;
    }
  }

  return false;
}

/**
 * Get all registered identities (for admin/testing)
 */
export function getAllIdentities(): IOTAIdentityDID[] {
  return Array.from(identityRegistry.values());
}

/**
 * Check if wallet has valid IOTA Identity
 */
export async function hasValidIdentity(walletAddress: string): Promise<boolean> {
  const identity = await resolveIdentity(walletAddress);
  if (!identity) return false;

  // Check if credentials are not expired
  const expiresAt = new Date(identity.verifiableCredentials.expiresAt);
  const now = new Date();

  return expiresAt > now;
}
