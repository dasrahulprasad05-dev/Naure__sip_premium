/* ==========================================================================
   NatureSip Address API Routes Mapping
   ========================================================================== */
import express from 'express';
import { 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress 
} from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All address book paths require user auth context
router.use(protect);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
