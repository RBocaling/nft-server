import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { createBooking, getBookingsByCustomerId, getCustomerBookingById, getCustomerBookings, getFuneralServiceBookings, updateBookingStatusAndLocation } from "../controllers/booking.controllers";

const router = Router();

router.post("/add-booking", authenticateToken, createBooking as any);
router.get("/get-customer-booking", authenticateToken, getCustomerBookings as any);
router.get("/:bookingId", authenticateToken, getCustomerBookingById as any);
router.get("/funeral/bookings", authenticateToken, getFuneralServiceBookings as any);
router.put("/:bookingId", authenticateToken, updateBookingStatusAndLocation as any);
router.get("/funeral/customer/:customerId", authenticateToken, getBookingsByCustomerId as any);



export default router;
