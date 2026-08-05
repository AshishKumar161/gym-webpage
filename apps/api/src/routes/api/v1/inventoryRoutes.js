import express from 'express';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProducts, 
  adjustStock 
} from '../../../controllers/inventoryController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/products', getProducts); // Members can view products

// Admin only routes
router.use(authorize('ADMIN'));
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/adjust-stock', adjustStock);

export default router;
