import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import consignmentRoutes from './routes/consignmentRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import identityRoutes from './routes/identityRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// For demo/development mode without live contract deployment
// In production, contracts would be deployed to IOTA testnet
// Mock Package IDs are used for demonstration purposes

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration - allow both localhost and Netlify
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://691a197355dea100089c0d03--emcs-on-ota-smart-contracts.netlify.app',
  'https://emcs-on-ota-smart-contracts.netlify.app', // Production Netlify URL
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'emcs-backend',
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'EMCS Blockchain Demo API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      consignments: '/api/consignments',
      createConsignment: 'POST /api/consignments',
      listConsignments: 'GET /api/consignments?operator={address}',
      getConsignment: 'GET /api/consignments/:arc',
      dispatchConsignment: 'POST /api/consignments/:arc/dispatch',
      receiveConsignment: 'POST /api/consignments/:arc/receive',
      getConsignmentEvents: 'GET /api/consignments/:arc/events',
      resolveIdentity: 'GET /api/identity/:walletAddress',
      verifyDomain: 'POST /api/identity/verify-domain',
      listIdentities: 'GET /api/identity',
    },
  });
});

// Mount routes
app.use('/api/consignments', consignmentRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/identity', identityRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EMCS Backend API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 IOTA RPC: ${process.env.IOTA_RPC_URL || 'Not configured'}`);
});

export default app;
