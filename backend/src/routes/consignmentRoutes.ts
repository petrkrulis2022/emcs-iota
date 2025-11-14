import { Router, Request, Response, NextFunction } from 'express';
import { arcGenerator } from '../services/arcGenerator.js';
import { iotaService } from '../services/iotaService.js';
import { notarizationService } from '../services/notarizationService.js';
import { lookupOperator } from '../services/seedRegistry.js';
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

// In-memory storage for demo mode (without live blockchain deployment)
const consignmentStore = new Map<string, Consignment>();
const eventsStore = new Map<string, MovementEvent[]>();

// Initialize mock consignments for demo
const initializeMockData = () => {
  // Demo wallet address from login page
  const demoWallet = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  
  const mockConsignments: Consignment[] = [
    {
      arc: '24CZ1234567890123456A',
      consignor: demoWallet,
      consignee: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      goodsType: 'Wine',
      quantity: 1000,
      unit: 'Liters',
      origin: 'Bordeaux, France',
      destination: 'Prague, Czech Republic',
      status: 'In Transit' as ConsignmentStatus,
      createdAt: '2024-11-10T08:30:00Z',
      dispatchedAt: '2024-11-10T14:20:00Z',
      transactionId: 'tx_mock_001',
      transportMode: 'Road',
      vehicleLicensePlate: '1AB-2345',
      documentHash: '0xabc123...',
      consignorInfo: {
        seedNumber: 'FR00123456789',
        companyName: 'Vignobles Bordeaux SA',
        vatNumber: 'FR12345678901',
        country: 'France',
        address: '123 Rue du Vin, Bordeaux 33000',
      },
      consigneeInfo: {
        seedNumber: 'CZ00987654321',
        companyName: 'Praha Wine Import s.r.o.',
        vatNumber: 'CZ98765432109',
        country: 'Czech Republic',
        address: 'Vinohradská 123, Praha 10000',
      },
    },
    {
      arc: '24DE9876543210987654B',
      consignor: demoWallet,
      consignee: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      goodsType: 'Beer',
      quantity: 600,
      unit: 'Liters',
      origin: 'Munich, Germany',
      destination: 'Milan, Italy',
      status: 'Draft' as ConsignmentStatus,
      createdAt: '2024-11-13T10:15:00Z',
      transactionId: 'tx_mock_002',
      transportMode: 'Road',
      vehicleLicensePlate: 'M-AB-1234',
      beerPackaging: {
        canSize: 500,
        cansPerPackage: 24,
        numberOfPackages: 50,
        totalCans: 1200,
        totalLiters: 600,
      },
      consignorInfo: {
        seedNumber: 'DE00111222333',
        companyName: 'Münchner Brauerei GmbH',
        vatNumber: 'DE111222333444',
        country: 'Germany',
        address: 'Braustraße 45, München 80331',
      },
      consigneeInfo: {
        seedNumber: 'IT00444555666',
        companyName: 'Milano Bevande SpA',
        vatNumber: 'IT44455566677',
        country: 'Italy',
        address: 'Via Commercio 78, Milano 20100',
      },
    },
    {
      arc: '24ES5555666677778888C',
      consignor: demoWallet,
      consignee: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      goodsType: 'Spirits',
      quantity: 500,
      unit: 'Liters',
      origin: 'Jerez, Spain',
      destination: 'London, United Kingdom',
      status: 'Received' as ConsignmentStatus,
      createdAt: '2024-11-08T09:00:00Z',
      dispatchedAt: '2024-11-08T15:30:00Z',
      receivedAt: '2024-11-11T11:45:00Z',
      transactionId: 'tx_mock_003',
      transportMode: 'Sea',
      containerNumber: 'CONT123456',
      documentHash: '0xdef456...',
      consignorInfo: {
        seedNumber: 'ES00777888999',
        companyName: 'Bodegas Jerez SA',
        vatNumber: 'ES77788899900',
        country: 'Spain',
        address: 'Calle Sherry 12, Jerez 11403',
      },
      consigneeInfo: {
        seedNumber: 'GB00123987654',
        companyName: 'London Spirits Ltd',
        vatNumber: 'GB12398765432',
        country: 'United Kingdom',
        address: '45 Thames Street, London EC4R 0AB',
      },
    },
    {
      arc: '24PL1111222233334444D',
      consignor: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      consignee: demoWallet,
      goodsType: 'Tobacco',
      quantity: 2000,
      unit: 'Kilograms',
      origin: 'Warsaw, Poland',
      destination: 'Vienna, Austria',
      status: 'In Transit' as ConsignmentStatus,
      createdAt: '2024-11-12T07:20:00Z',
      dispatchedAt: '2024-11-12T13:00:00Z',
      transactionId: 'tx_mock_004',
      transportMode: 'Road',
      vehicleLicensePlate: 'WA-12345',
      documentHash: '0xghi789...',
      consignorInfo: {
        seedNumber: 'PL00555666777',
        companyName: 'Polska Tobacco Sp. z o.o.',
        vatNumber: 'PL55566677788',
        country: 'Poland',
        address: 'ul. Handlowa 89, Warszawa 00-001',
      },
      consigneeInfo: {
        seedNumber: 'AT00888999000',
        companyName: 'Wien Tabak GmbH',
        vatNumber: 'AT88899900011',
        country: 'Austria',
        address: 'Tabakgasse 23, Wien 1010',
      },
    },
    {
      arc: '24CZ7777888899990000F',
      consignor: demoWallet,
      consignee: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      goodsType: 'Beer',
      quantity: 792,
      unit: 'Liters',
      origin: 'Prague, Czech Republic',
      destination: 'Vienna, Austria',
      status: 'In Transit' as ConsignmentStatus,
      createdAt: '2024-11-11T09:00:00Z',
      dispatchedAt: '2024-11-11T15:30:00Z',
      transactionId: 'tx_mock_006',
      transportMode: 'Road',
      vehicleLicensePlate: 'CZ-1234',
      documentHash: '0xjkl012...',
      beerPackaging: {
        canSize: 330,
        cansPerPackage: 24,
        numberOfPackages: 100,
        totalCans: 2400,
        totalLiters: 792,
      },
      consignorInfo: {
        seedNumber: 'CZ00123456789',
        companyName: 'Pilsner Urquell Export s.r.o.',
        vatNumber: 'CZ12345678901',
        country: 'Czech Republic',
        address: 'Pivovarnická 123, Praha 15000',
      },
      consigneeInfo: {
        seedNumber: 'AT00999888777',
        companyName: 'Wien Beer Import GmbH',
        vatNumber: 'AT99988877766',
        country: 'Austria',
        address: 'Bierstraße 45, Wien 1020',
      },
    },
    {
      arc: '24NL4444555566667777E',
      consignor: demoWallet,
      consignee: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      goodsType: 'Energy',
      quantity: 10000,
      unit: 'Liters',
      origin: 'Rotterdam, Netherlands',
      destination: 'Brussels, Belgium',
      status: 'Draft' as ConsignmentStatus,
      createdAt: '2024-11-14T06:00:00Z',
      transactionId: 'tx_mock_005',
      transportMode: 'Road',
      vehicleLicensePlate: 'NL-AB-12',
      consignorInfo: {
        seedNumber: 'NL00222333444',
        companyName: 'Rotterdam Energy BV',
        vatNumber: 'NL22233344455',
        country: 'Netherlands',
        address: 'Energieweg 56, Rotterdam 3011',
      },
      consigneeInfo: {
        seedNumber: 'BE00666777888',
        companyName: 'Brussels Fuel SA',
        vatNumber: 'BE66677788899',
        country: 'Belgium',
        address: 'Avenue de l\'Énergie 34, Bruxelles 1000',
      },
    },
  ];

  // Add mock consignments to store
  mockConsignments.forEach(consignment => {
    consignmentStore.set(consignment.arc, consignment);
    
    // Add corresponding events
    const events: MovementEvent[] = [
      {
        type: 'Created',
        timestamp: consignment.createdAt,
        actor: consignment.consignor,
        transactionId: consignment.transactionId || '',
      },
    ];
    
    if (consignment.dispatchedAt) {
      events.push({
        type: 'Dispatched',
        timestamp: consignment.dispatchedAt,
        actor: consignment.consignor,
        transactionId: consignment.transactionId || '',
        documentHash: consignment.documentHash,
      });
    }
    
    if (consignment.receivedAt) {
      events.push({
        type: 'Received',
        timestamp: consignment.receivedAt,
        actor: consignment.consignee,
        transactionId: consignment.transactionId || '',
      });
    }
    
    eventsStore.set(consignment.arc, events);
  });
};

// Initialize mock data on module load
initializeMockData();

/**
 * GET /api/consignments/all
 * Get all consignments (no operator filter) - for demo/admin view
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📋 Fetching all consignments (no filter)');

    // Get all consignments from store
    const allConsignments = Array.from(consignmentStore.values());

    console.log(`✅ Found ${allConsignments.length} total consignments`);

    res.json({
      consignments: allConsignments,
      count: allConsignments.length,
    });
  } catch (error) {
    next(error);
  }
});

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
      transportMode,
      vehicleLicensePlate,
      containerNumber,
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

    // Lookup SEED operator information
    const consignorInfo = lookupOperator(consignor);
    const consigneeInfo = lookupOperator(consignee);

    if (!consignorInfo) {
      throw new AppError('Consignor not found in SEED registry', 400);
    }

    if (!consigneeInfo) {
      throw new AppError('Consignee not found in SEED registry', 400);
    }

    // Validate authorization for goods type
    if (!consignorInfo.authorizedGoods.includes(goodsType)) {
      throw new AppError(`Consignor not authorized for ${goodsType}`, 400);
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

    // Store consignment in memory for demo mode
    const consignment: Consignment = {
      arc,
      consignor,
      consignee,
      goodsType,
      quantity,
      unit,
      origin,
      destination,
      status: 'Draft' as ConsignmentStatus,
      createdAt: new Date().toISOString(),
      transactionId,
      transportMode,
      vehicleLicensePlate,
      containerNumber,
      consignorInfo: {
        seedNumber: consignorInfo.seedNumber,
        companyName: consignorInfo.companyName,
        vatNumber: consignorInfo.vatNumber,
        country: consignorInfo.country,
        address: `${consignorInfo.address}, ${consignorInfo.city} ${consignorInfo.postalCode}`,
      },
      consigneeInfo: {
        seedNumber: consigneeInfo.seedNumber,
        companyName: consigneeInfo.companyName,
        vatNumber: consigneeInfo.vatNumber,
        country: consigneeInfo.country,
        address: `${consigneeInfo.address}, ${consigneeInfo.city} ${consigneeInfo.postalCode}`,
      },
    };
    consignmentStore.set(arc, consignment);

    // Store creation event
    const creationEvent: MovementEvent = {
      type: 'Created',
      timestamp: new Date().toISOString(),
      actor: consignor,
      transactionId,
    };
    eventsStore.set(arc, [creationEvent]);

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

    // Get consignment from in-memory store (demo mode)
    const consignment = consignmentStore.get(arc);

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

    // Get events from in-memory store (demo mode)
    const mappedEvents = eventsStore.get(arc) || [];

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
