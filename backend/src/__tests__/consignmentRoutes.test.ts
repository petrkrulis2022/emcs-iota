import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import consignmentRoutes from '../routes/consignmentRoutes.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { arcGenerator } from '../services/arcGenerator.js';
import { iotaService } from '../services/iotaService.js';
import { notarizationService } from '../services/notarizationService.js';
import { ConsignmentStatus } from '../types/index.js';

// Create test app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/api/consignments', consignmentRoutes);
  app.use(errorHandler);
  return app;
}

describe('Consignment API Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('POST /api/consignments', () => {
    it('should create a new consignment with valid data', async () => {
      // Mock services
      const mockARC = '24EU1234567890123456';
      const mockTxId = '0xabc123';
      
      vi.spyOn(arcGenerator, 'generateARC').mockResolvedValue(mockARC);
      vi.spyOn(iotaService, 'executeTransaction').mockResolvedValue(mockTxId);

      const validConsignment = {
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
      };

      const response = await request(app)
        .post('/api/consignments')
        .send(validConsignment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.arc).toBe(mockARC);
      expect(response.body.data.transactionId).toBe(mockTxId);
      expect(response.body.data.consignmentId).toBe(mockTxId);
      expect(arcGenerator.generateARC).toHaveBeenCalled();
      expect(iotaService.executeTransaction).toHaveBeenCalled();
    });

    it('should reject consignment with missing required fields', async () => {
      const invalidConsignment = {
        consignor: '0x123abc',
        // Missing consignee and other fields
      };

      const response = await request(app)
        .post('/api/consignments')
        .send(invalidConsignment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject consignment with invalid quantity', async () => {
      const invalidConsignment = {
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: -100, // Invalid negative quantity
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
      };

      const response = await request(app)
        .post('/api/consignments')
        .send(invalidConsignment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Quantity must be a positive number');
    });

    it('should reject consignment with invalid address format', async () => {
      const invalidConsignment = {
        consignor: 'invalid-address', // Missing 0x prefix
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
      };

      const response = await request(app)
        .post('/api/consignments')
        .send(invalidConsignment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid IOTA address format');
    });

    it('should reject consignment with invalid goods type', async () => {
      const invalidConsignment = {
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'InvalidType',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
      };

      const response = await request(app)
        .post('/api/consignments')
        .send(invalidConsignment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid goods type');
    });

    it('should reject consignment with invalid unit', async () => {
      const invalidConsignment = {
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'InvalidUnit',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
      };

      const response = await request(app)
        .post('/api/consignments')
        .send(invalidConsignment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid unit');
    });
  });

  describe('GET /api/consignments', () => {
    it('should list consignments for an operator', async () => {
      const mockConsignments = [
        {
          arc: '24EU1234567890123456',
          consignor: '0x123abc',
          consignee: '0x456def',
          goodsType: 'Wine',
          quantity: 1000,
          unit: 'Liters',
          origin: 'Bordeaux, France',
          destination: 'Berlin, Germany',
          status: ConsignmentStatus.DRAFT,
          createdAt: '2025-11-13T10:00:00Z',
        },
      ];

      vi.spyOn(iotaService, 'getConsignmentsByOperator').mockResolvedValue(mockConsignments);

      const response = await request(app)
        .get('/api/consignments')
        .query({ operator: '0x123abc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.consignments).toHaveLength(1);
      expect(response.body.data.consignments[0].arc).toBe('24EU1234567890123456');
      expect(iotaService.getConsignmentsByOperator).toHaveBeenCalledWith('0x123abc');
    });

    it('should filter consignments by status', async () => {
      const mockConsignments = [
        {
          arc: '24EU1234567890123456',
          consignor: '0x123abc',
          consignee: '0x456def',
          goodsType: 'Wine',
          quantity: 1000,
          unit: 'Liters',
          origin: 'Bordeaux, France',
          destination: 'Berlin, Germany',
          status: ConsignmentStatus.DRAFT,
          createdAt: '2025-11-13T10:00:00Z',
        },
        {
          arc: '24EU9876543210987654',
          consignor: '0x123abc',
          consignee: '0x789ghi',
          goodsType: 'Beer',
          quantity: 500,
          unit: 'Liters',
          origin: 'Munich, Germany',
          destination: 'Paris, France',
          status: ConsignmentStatus.IN_TRANSIT,
          createdAt: '2025-11-13T11:00:00Z',
        },
      ];

      vi.spyOn(iotaService, 'getConsignmentsByOperator').mockResolvedValue(mockConsignments);

      const response = await request(app)
        .get('/api/consignments')
        .query({ operator: '0x123abc', status: 'Draft' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.consignments).toHaveLength(1);
      expect(response.body.data.consignments[0].status).toBe(ConsignmentStatus.DRAFT);
    });

    it('should reject request without operator parameter', async () => {
      const response = await request(app)
        .get('/api/consignments')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing or invalid operator query parameter');
    });

    it('should reject request with invalid operator address format', async () => {
      const response = await request(app)
        .get('/api/consignments')
        .query({ operator: 'invalid-address' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid IOTA address format');
    });

    it('should reject request with invalid status filter', async () => {
      const response = await request(app)
        .get('/api/consignments')
        .query({ operator: '0x123abc', status: 'InvalidStatus' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
    });
  });

  describe('GET /api/consignments/:arc', () => {
    it('should get consignment details for existing ARC', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.DRAFT,
        createdAt: '2025-11-13T10:00:00Z',
      };

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);

      const response = await request(app)
        .get('/api/consignments/24EU1234567890123456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.arc).toBe('24EU1234567890123456');
      expect(response.body.data.goodsType).toBe('Wine');
      expect(iotaService.getConsignmentByARC).toHaveBeenCalledWith('24EU1234567890123456');
    });

    it('should return 404 for non-existing ARC', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(null);

      const response = await request(app)
        .get('/api/consignments/24EU1234567890123456')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Consignment not found');
    });

    it('should reject invalid ARC format', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(false);

      const response = await request(app)
        .get('/api/consignments/INVALID-ARC')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ARC format');
    });
  });

  describe('POST /api/consignments/:arc/dispatch', () => {
    it('should dispatch consignment with valid authorization', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.DRAFT,
        createdAt: '2025-11-13T10:00:00Z',
      };

      const mockDocHash = '0xdoc123';
      const mockTxId = '0xtx456';

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);
      vi.spyOn(notarizationService, 'createEADDocument').mockReturnValue({});
      vi.spyOn(notarizationService, 'notarizeDocument').mockResolvedValue({
        documentHash: mockDocHash,
        transactionId: '0xnotarize123',
        timestamp: '2025-11-13T11:00:00Z',
      });
      vi.spyOn(iotaService, 'executeTransaction').mockResolvedValue(mockTxId);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/dispatch')
        .send({ consignor: '0x123abc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionId).toBe(mockTxId);
      expect(response.body.data.documentHash).toBe(mockDocHash);
      expect(response.body.data.dispatchedAt).toBeDefined();
    });

    it('should reject dispatch with unauthorized consignor', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.DRAFT,
        createdAt: '2025-11-13T10:00:00Z',
      };

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/dispatch')
        .send({ consignor: '0xWRONG' }) // Wrong consignor
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should reject dispatch for non-Draft consignment', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.IN_TRANSIT, // Already dispatched
        createdAt: '2025-11-13T10:00:00Z',
      };

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/dispatch')
        .send({ consignor: '0x123abc' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot dispatch consignment with status');
    });

    it('should reject dispatch with missing consignor', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/dispatch')
        .send({}) // Missing consignor
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing or invalid consignor address');
    });

    it('should reject dispatch for non-existing consignment', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(null);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/dispatch')
        .send({ consignor: '0x123abc' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Consignment not found');
    });
  });

  describe('POST /api/consignments/:arc/receive', () => {
    it('should confirm receipt with valid authorization', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.IN_TRANSIT,
        createdAt: '2025-11-13T10:00:00Z',
      };

      const mockTxId = '0xtx789';

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);
      vi.spyOn(iotaService, 'executeTransaction').mockResolvedValue(mockTxId);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/receive')
        .send({ consignee: '0x456def' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionId).toBe(mockTxId);
      expect(response.body.data.receivedAt).toBeDefined();
    });

    it('should reject receipt with unauthorized consignee', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.IN_TRANSIT,
        createdAt: '2025-11-13T10:00:00Z',
      };

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/receive')
        .send({ consignee: '0xWRONG' }) // Wrong consignee
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Unauthorized');
    });

    it('should reject receipt for non-InTransit consignment', async () => {
      const mockConsignment = {
        arc: '24EU1234567890123456',
        consignor: '0x123abc',
        consignee: '0x456def',
        goodsType: 'Wine',
        quantity: 1000,
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
        status: ConsignmentStatus.DRAFT, // Not yet dispatched
        createdAt: '2025-11-13T10:00:00Z',
      };

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(mockConsignment);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/receive')
        .send({ consignee: '0x456def' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot receive consignment with status');
    });

    it('should reject receipt with missing consignee', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/receive')
        .send({}) // Missing consignee
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing or invalid consignee address');
    });

    it('should reject receipt for non-existing consignment', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'getConsignmentByARC').mockResolvedValue(null);

      const response = await request(app)
        .post('/api/consignments/24EU1234567890123456/receive')
        .send({ consignee: '0x456def' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Consignment not found');
    });
  });

  describe('GET /api/consignments/:arc/events', () => {
    it('should get movement events for a consignment', async () => {
      const mockEvents = [
        {
          type: 'Created',
          timestamp: '2025-11-13T10:00:00Z',
          actor: '0x123abc',
          transactionId: '0xtx1',
        },
        {
          type: 'Dispatched',
          timestamp: '2025-11-13T11:00:00Z',
          actor: '0x123abc',
          transactionId: '0xtx2',
          documentHash: '0xdoc123',
        },
      ];

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'queryEvents').mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/api/consignments/24EU1234567890123456/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(2);
      expect(response.body.data.events[0].type).toBe('Created');
      expect(response.body.data.events[1].type).toBe('Dispatched');
      expect(response.body.data.events[1].documentHash).toBe('0xdoc123');
    });

    it('should return empty array for consignment with no events', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'queryEvents').mockResolvedValue([]);

      const response = await request(app)
        .get('/api/consignments/24EU1234567890123456/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(0);
    });

    it('should reject invalid ARC format', async () => {
      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(false);

      const response = await request(app)
        .get('/api/consignments/INVALID-ARC/events')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ARC format');
    });

    it('should sort events chronologically', async () => {
      const mockEvents = [
        {
          type: 'Dispatched',
          timestamp: '2025-11-13T11:00:00Z',
          actor: '0x123abc',
          transactionId: '0xtx2',
        },
        {
          type: 'Created',
          timestamp: '2025-11-13T10:00:00Z',
          actor: '0x123abc',
          transactionId: '0xtx1',
        },
        {
          type: 'Received',
          timestamp: '2025-11-13T15:00:00Z',
          actor: '0x456def',
          transactionId: '0xtx3',
        },
      ];

      vi.spyOn(arcGenerator, 'validateARC').mockReturnValue(true);
      vi.spyOn(iotaService, 'queryEvents').mockResolvedValue(mockEvents);

      const response = await request(app)
        .get('/api/consignments/24EU1234567890123456/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(3);
      // Verify chronological order (oldest first)
      expect(response.body.data.events[0].type).toBe('Created');
      expect(response.body.data.events[1].type).toBe('Dispatched');
      expect(response.body.data.events[2].type).toBe('Received');
    });
  });
});
