import { Router, Request, Response, NextFunction } from 'express';
import { lookupOperator, getAllOperators } from '../services/seedRegistry.js';
import { AppError } from '../middleware/errorHandler.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * GET /api/seed/operators/:address
 * Lookup operator by wallet address
 */
router.get('/operators/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;

    if (!address.startsWith('0x')) {
      throw new AppError('Invalid wallet address format', 400);
    }

    const operator = lookupOperator(address);

    if (!operator) {
      throw new AppError('Operator not found in SEED registry', 404);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: operator,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/seed/operators
 * Get all registered operators
 */
router.get('/operators', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operators = getAllOperators();

    const response: ApiResponse<any> = {
      success: true,
      data: { operators },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
