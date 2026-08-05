import express from 'express';
import { 
  createAsset, 
  updateAsset, 
  deleteAsset, 
  getAssets, 
  logMaintenance, 
  resolveMaintenance 
} from '../../../controllers/assetController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));

router.get('/', getAssets);
router.post('/', createAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);
router.post('/:id/maintenance', logMaintenance);
router.put('/maintenance/:logId/resolve', resolveMaintenance);

export default router;
