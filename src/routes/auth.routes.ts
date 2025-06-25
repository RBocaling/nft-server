import { Router } from 'express';
import { registerUser, loginUser } from '../services/auth.services';
import { authenticateToken } from '../middlewares/auth.middleware';
import { emailVerify, getFuneralProgress, getUserAuth, getUserList, getUserProgress, refreshAccessToken, register, uploadDocumentId } from '../controllers/auth.controllers';

const router = Router();

router.post('/register', register );

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.json({ token });
  } catch (error:any) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/refresh-token', refreshAccessToken as any);

router.put("/upload-documents", authenticateToken, uploadDocumentId as any);
router.get("/user-auth", authenticateToken, getUserAuth as any);
router.get("/user-list", getUserList as any);
router.get("/user-progress", authenticateToken, getUserProgress as any);
router.get("/funeral-progress", authenticateToken, getFuneralProgress as any);
router.get("/verify-email", emailVerify as any);


export default router;
