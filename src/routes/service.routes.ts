import { Router } from "express";
import { createService, getMyServices, getAllServices, addServiceDetail, deleteDetails, deleteService  } from "../controllers/service.controllers";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/add-service", authenticateToken, createService  as any);
router.post("/add-detail/:serviceId", authenticateToken, addServiceDetail  as any);
router.get("/my-services", authenticateToken, getMyServices as any);
router.get("/list-services", getAllServices as any);
router.delete("/:serviceType/details/:detailId", deleteDetails as any);
router.delete("/delete-service/:serviceId", deleteService as any);
export default router;
