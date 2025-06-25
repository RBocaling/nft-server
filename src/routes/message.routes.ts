import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { getCustomerChatList, getFuneralChatList, getMessagesByConversation, sendMessage } from "../controllers/message.controllers";

const router = Router();

router.get("/byId/:conversationId", getMessagesByConversation as any);
router.post("/send-message", authenticateToken, sendMessage as any);
router.get("/customer-message-list", authenticateToken, getCustomerChatList as any);
router.get("/funeral-message-list", authenticateToken, getFuneralChatList as any);


export default router;
