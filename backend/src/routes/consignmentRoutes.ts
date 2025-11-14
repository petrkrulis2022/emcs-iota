import { Router, Request, Response, NextFunction } from 'express';
import { arcGenerator } from '../services/arcGenerator.js';
import { iotaService } from '../services/iotaService.js';
import { notarizationService } from '../services/notarizationService.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  CreateConsignmentRequest,
  DispatchConsignmentRequest,
  ReceiveConsignmentRequest,
  ConsignmentStatus,
  ApiResponse,
  CreateConsignmentResponse,
  DispatchConsignmentResponse,
  ReceiveConsignmentResponse,
  Consignment,
  MovementEvent,
} from '../types/index.js';

const router = Router();

/**
 * POST /api/consignments
 * Create a new consignment
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      consignor,
      consignee,
      goodsType,
      quantity,
      unit,
      origin,
      destination,
    } = req.body as CreateConsignmentRequest;

    // Validate request body
    if (!consignor || !consignee || !goodsType || !quantity || !unit || !origin || !destination) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate quantity
    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new AppError('Quantity must be a positive number', 400);
    }

    // Validate addresses (basic check)
    if (!consignor.startsWith('0x') || !consignee.startsWith('0x')) {
      throw new AppError('Invalid IOTA address format', 400);
    }

    // Validate goods type
    const validGoodsTypes = ['Wine', 'Beer', 'Spirits', 'Tobacco', 'Energy'];
    if (!validGoodsTypes.includes(goodsType)) {
      throw new AppError(`Invalid goods type. Must be one of: ${validGoodsTypes.join(', ')}`, 400);
    }

    // Validate unit
    const validUnits = ['Liters', 'Kilograms', 'Units'];
    if (!validUnits.includes(unit)) {
      throw new AppError(`Invalid unit. Must be one of: ${validUnits.join(', ')}`, 400);
    }

    console.log('📦 Creating new consignment...');

    // Generate unique ARC
    const arc = await arcGenerator.generateARC();
    console.log(`✅ Generated ARC: ${arc}`);

    // Build transaction to call Move create_consignment function
    const transactionId = await iotaService.executeTransaction(
      (tx: any) => {
        // TODO: Implement actual Move call when SDK is available
        // tx.moveCall({
        //   target: `${contractAddress}::consignment::create_consignment`,
        //   arguments: [
        //     tx.pure(arc),
        //     tx.pure(consignor),
        //     tx.pure(consignee),
        //     tx.pure(goodsType),
        //     tx.pure(quantity),
        //     tx.pure(unit),
        //     tx.pure(origin),
        //     tx.pure(destination),
        //   ],
        // });
      },
      consignor
    );

    console.log(`✅ Consignment created with transaction: ${transactionId}`);

    // For now, use transaction ID as consignment ID
    const consignmentId = transactionId;

    const response: ApiResponse<CreateConsignmentResponse> = {
      success: true,
      data: {
        arc,
        transactionId,
        consignmentId,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consignments
 * List consignments for an operator
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { operator, status } = req.query;

    // Validate operator parameter
    if (!operator || typeof operator !== 'string') {
      throw new AppError('Missing or invalid operator query parameter', 400);
    }

    // Validate operator address format
    if (!operator.startsWith('0x')) {
      throw new AppError('Invalid IOTA address format', 400);
    }

    console.log(`📋 Fetching consignments for operator: ${operator}`);

    // Query IOTA blockchain for consignments
    const allConsignments = await iotaService.getConsignmentsByOperator(operator);

    // Filter by status if provided
    let filteredConsignments = allConsignments;
    if (status && typeof status === 'string') {
      const validStatuses = ['Draft', 'In Transit', 'Received'];
      if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      filteredConsignments = allConsignments.filter(
        (c: Consignment) => c.status === status
      );
      console.log(`🔍 Filtered to ${filteredConsignments.length} consignments with status: ${status}`);
    }

    console.log(`✅ Found ${filteredConsignments.length} consignments`);

    const response: ApiResponse<{ consignments: Consignment[] }> = {
      success: true,
      data: {
        consignments: filteredConsignments,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consignments/:arc
 * Get consignment details by ARC
 */
router.get('/:arc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { arc } = req.params;

    // Validate ARC format
    if (!arcGenerator.validateARC(arc)) {
      throw new AppError('Invalid ARC format', 400);
    }

    console.log(`🔍 Fetching consignment with ARC: ${arc}`);

    // Query IOTA blockchain for consignment
    const consignment = await iotaService.getConsignmentByARC(arc);

    if (!consignment) {
      throw new AppError('Consignment not found', 404);
    }

    console.log(`✅ Found consignment: ${arc}`);

    const response: ApiResponse<Consignment> = {
      success: true,
      data: consignment,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consignments/:arc/dispatch
 * Dispatch a consignment (change status to In Transit)
 */
router.post('/:arc/dispatch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { arc } = req.params;
    const { consignor } = req.body as DispatchConsignmentRequest;

    // Validate ARC format
    if (!arcGenerator.validateARC(arc)) {
      throw new AppError('Invalid ARC format', 400);
    }

    // Validate consignor address
    if (!consignor || !consignor.startsWith('0x')) {
      throw new AppError('Missing or invalid consignor address', 400);
    }

    console.log(`📤 Dispatching consignment: ${arc}`);

    // Fetch consignment from blockchain
    const consignment = await iotaService.getConsignmentByARC(arc);

    if (!consignment) {
      throw new AppError('Consignment not found', 404);
    }

    // Verify consignor matches
    if (consignment.consignor !== consignor) {
      throw new AppError('Unauthorized: Only the consignor can dispatch this consignment', 403);
    }

    // Verify current status is Draft
    if (consignment.status !== ConsignmentStatus.DRAFT) {
      throw new AppError(`Cannot dispatch consignment with status: ${consignment.status}`, 400);
    }

    // Create e-AD document object
    const eadDocument = notarizationService.createEADDocument({
      arc: consignment.arc,
      consignor: consignment.consignor,
      consignee: consignment.consignee,
      goodsType: consignment.goodsType,
      quantity: consignment.quantity,
      unit: consignment.unit,
      origin: consignment.origin,
      destination: consignment.destination,
    });

    console.log('📄 Created e-AD document');

    // Hash document using NotarizationService
    const notarizationResult = await notarizationService.notarizeDocument(eadDocument);
    const documentHash = notarizationResult.documentHash;

    console.log(`✅ Document notarized with hash: ${documentHash}`);

    // Build transaction to call Move dispatch_consignment function
    const transactionId = await iotaService.executeTransaction(
      (tx: any) => {
        // TODO: Implement actual Move call when SDK is available
        // tx.moveCall({
        //   target: `${contractAddress}::consignment::dispatch_consignment`,
        //   arguments: [
        //     tx.object(consignment.id),
        //     tx.pure(documentHash),
        //   ],
        // });
      },
      consignor
    );

    const dispatchedAt = new Date().toISOString();

    console.log(`✅ Consignment dispatched with transaction: ${transactionId}`);

    const response: ApiResponse<DispatchConsignmentResponse> = {
      success: true,
      data: {
        transactionId,
        documentHash,
        dispatchedAt,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consignments/:arc/receive
 * Confirm receipt of a consignment
 */
router.post('/:arc/receive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { arc } = req.params;
    const { consignee } = req.body as ReceiveConsignmentRequest;

    // Validate ARC format
    if (!arcGenerator.validateARC(arc)) {
      throw new AppError('Invalid ARC format', 400);
    }

    // Validate consignee address
    if (!consignee || !consignee.startsWith('0x')) {
      throw new AppError('Missing or invalid consignee address', 400);
    }

    console.log(`📥 Confirming receipt of consignment: ${arc}`);

    // Fetch consignment from blockchain
    const consignment = await iotaService.getConsignmentByARC(arc);

    if (!consignment) {
      throw new AppError('Consignment not found', 404);
    }

    // Verify consignee matches
    if (consignment.consignee !== consignee) {
      throw new AppError('Unauthorized: Only the consignee can confirm receipt of this consignment', 403);
    }

    // Verify current status is In Transit
    if (consignment.status !== ConsignmentStatus.IN_TRANSIT) {
      throw new AppError(`Cannot receive consignment with status: ${consignment.status}`, 400);
    }

    // Build transaction to call Move receive_consignment function
    const transactionId = await iotaService.executeTransaction(
      (tx: any) => {
        // TODO: Implement actual Move call when SDK is available
        // tx.moveCall({
        //   target: `${contractAddress}::consignment::receive_consignment`,
        //   arguments: [
        //     tx.object(consignment.id),
        //   ],
        // });
      },
      consignee
    );

    const receivedAt = new Date().toISOString();

    console.log(`✅ Consignment received with transaction: ${transactionId}`);

    const response: ApiResponse<ReceiveConsignmentResponse> = {
      success: true,
      data: {
        transactionId,
        receivedAt,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consignments/:arc/events
 * Get movement history for a consignment
 */
router.get('/:arc/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { arc } = req.params;

    // Validate ARC format
    if (!arcGenerator.validateARC(arc)) {
      throw new AppError('Invalid ARC format', 400);
    }

    console.log(`📜 Fetching movement events for consignment: ${arc}`);

    // Query IOTA events API for all MovementEvents with matching ARC
    const events = await iotaService.queryEvents({
      // TODO: Implement actual event filter when SDK is available
      // MoveEventType: `${contractAddress}::consignment::MovementEvent`,
      // filter: { arc }
    });

    // Map events to API response format
    const mappedEvents: MovementEvent[] = events.map((event: any) => ({
      type: event.type,
      timestamp: event.timestamp,
      actor: event.actor,
      transactionId: event.transactionId,
      documentHash: event.documentHash,
    }));

    // Sort events chronologically (oldest first)
    mappedEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(`✅ Found ${mappedEvents.length} movement events`);

    const response: ApiResponse<{ events: MovementEvent[] }> = {
      success: true,
      data: {
        events: mappedEvents,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
