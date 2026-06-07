/* ==========================================================================
   NatureSip Premium Express REST API Server Entry
   ========================================================================== */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import juiceRoutes from './routes/juices.js';
import quizRoutes from './routes/quiz.js';
import paymentRoutes from './routes/payments.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/address.js';
import reviewRoutes from './routes/reviews.js';
import { isMockEnabled } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Configure Global Middlewares
app.use(cors());

// Configure express.json with rawBody verification helper for Stripe webhooks
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/payments/webhook')) {
      req.rawBody = buf;
    }
  }
}));

// 2. REST API Endpoint Mounts
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-juices', juiceRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);

// 3. System Health Probe Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NatureSip Premium REST API is operating safely.',
    environment: process.env.NODE_ENV || 'development',
    virtual_fallback_db: isMockEnabled()
  });
});

// 4. Fallback 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint route ${req.originalUrl} not found on this server.`
  });
});

// 5. Centralized Error Handler (Must be mounted last)
app.use(errorHandler);

// 6. Bind listener port
app.listen(PORT, () => {
  console.log(`🚀 NatureSip REST API Server boot complete.`);
  console.log(`🌐 Listening on: http://localhost:${PORT}`);
  console.log(`🛡️ Simulated memory DB fallback state: ${isMockEnabled()}`);
});
