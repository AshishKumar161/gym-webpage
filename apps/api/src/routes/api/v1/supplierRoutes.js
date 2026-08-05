import express from 'express';
import { 
  createSupplier, 
  updateSupplier, 
  getSuppliers, 
  createPO, 
  updatePOStatus, 
  getPOs 
} from '../../../controllers/supplierController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

router.get('/po', getPOs);
router.post('/po', createPO);
router.put('/po/:id', updatePOStatus);

export default router;
