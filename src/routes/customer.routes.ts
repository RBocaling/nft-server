import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createCustomer, getCustomerList, getCustomers, updateCustomer } from '../controllers/customer.controllers';

const router = Router();

// Routes
router.post('/', authenticateToken ,createCustomer);
router.get('/customer-list', authenticateToken ,getCustomerList);
router.put('/', authenticateToken ,updateCustomer);
router.get('/', authenticateToken, getCustomers);    

export default router;
