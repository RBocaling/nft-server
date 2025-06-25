import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getCustomerById } from "../services/user.services";

export const getCustomerChatList = async (req: Request, res: Response) => {
  try {
    const customerId = await getCustomerById(Number(req.user?.id));

    const bookings = await prisma.booking.findMany({
      where: { customerId: customerId?.id },
      include: {
        conversation: {
          include: {
            messages: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("[Get Customer Bookings Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};
