/* ==========================================================================
   NatureSip Shopping Cart API Routes Mapping
   ========================================================================== */
import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  emptyCart 
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All Cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/', emptyCart);
router.delete('/:itemId', removeCartItem);

export default router;
