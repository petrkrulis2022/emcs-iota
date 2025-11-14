import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import consignmentRoutes from './routes/consignmentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
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
    },
  });
});

// Mount consignment routes
app.use('/api/consignments', consignmentRoutes);

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
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
  console.log(`🔗 IOTA RPC: ${process.env.IOTA_RPC_URL || 'Not configured'}`);
});

export default app;
