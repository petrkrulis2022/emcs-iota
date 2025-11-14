import { Router, Request, Response, NextFunction } from 'express';
import { resolveIdentity, verifyDomainLinkage, getAllIdentities } from '../services/iotaIdentity.js';
import { AppError } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * GET /api/identity/:walletAddress
 * Resolve IOTA Identity DID from wallet address
 */
router.get('/:walletAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !walletAddress.startsWith('0x')) {
      throw new AppError('Invalid wallet address format', 400);
    }

    console.log(`🔍 Resolving IOTA Identity for wallet: ${walletAddress}`);

    const identity = await resolveIdentity(walletAddress);

    if (!identity) {
      throw new AppError('IOTA Identity not found for this wallet address', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: identity,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/identity/verify-domain
 * Verify domain linkage for a DID
 */
router.post('/verify-domain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { did, domain } = req.body;

    if (!did || !domain) {
      throw new AppError('DID and domain are required', 400);
    }

    console.log(`🔗 Verifying domain linkage: ${did} <-> ${domain}`);

    const verified = await verifyDomainLinkage(did, domain);

    const response: ApiResponse = {
      success: true,
      data: { verified },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/identity
 * Get all registered identities (for testing/admin)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identities = getAllIdentities();

    const response: ApiResponse = {
      success: true,
      data: { identities, count: identities.length },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
