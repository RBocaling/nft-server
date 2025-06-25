import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { addCustomerFamily, deleteCustomerFamily, getCustomerFamily, updateCustomerFamily } from '../controllers/family.controllers';

const router = Router();

// Routes
router.post('/', authenticateToken, addCustomerFamily as any);
router.get('/', authenticateToken, getCustomerFamily as any);

router.put('/', authenticateToken, updateCustomerFamily);
router.delete('/:id', authenticateToken, deleteCustomerFamily);
   
export default router;
