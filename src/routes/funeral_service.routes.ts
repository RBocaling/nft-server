import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createFuneral, createFuneralAvailablePayment, deleteAvailablePayments, getAllFuneralAvailablePayments, getFunerals, setIsCustomCasket, updateFuneral, updateFuneralAvailablePayment } from '../controllers/funeral_service.controllers';

const router = Router();

// Routes
router.post('/', authenticateToken, createFuneral);
router.put('/', authenticateToken, updateFuneral);
router.get('/', authenticateToken, getFunerals);

router.post('/add-payment', authenticateToken, createFuneralAvailablePayment);  
router.put('/update-payment/:id', authenticateToken, updateFuneralAvailablePayment);  
router.get('/get-payment', authenticateToken, getAllFuneralAvailablePayments);  
router.delete('/delete-payment/:id', authenticateToken, deleteAvailablePayments);  

router.put('/set-IsCustomCasket', authenticateToken, setIsCustomCasket as any);    

export default router;
