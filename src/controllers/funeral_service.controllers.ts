import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getFuneralServiceById } from "../services/user.services";

export const createFuneral = async (req: Request, res: Response) => {
  const { firstName, lastName, location, phone, funeralName,personalEncharge } = req.body;

  try {
    const funeral = await prisma.funeralService.create({
      data: {
        firstName,
        lastName,
        phone,
        location,
        userId: Number(req.user?.id),
        isCustom3dCasket: false,
        funeralName,
        personalEncharge
      },
    });

    res.status(201).json(funeral);
  } catch (error) {
    res.status(500).json({ message: "Failed to create funeral", error });
  }
};

export const updateFuneral = async (req: Request, res: Response) => {
  const { firstName, lastName, location, phone, funeralName } = req.body;
  const funeralIndo = await getFuneralServiceById(Number(req.user?.id));
  try {
    const funeral = await prisma.funeralService.update({
      where: { id: funeralIndo?.id },
      data: {
        firstName,
        lastName,
        phone,
        location,
        isCustom3dCasket: false,
        funeralName,
      },
    });

    res.status(201).json(funeral);
  } catch (error) {
    res.status(500).json({ message: "Failed to create funeral", error });
  }
};

export const getFunerals = async (req: Request, res: Response) => {
  try {
    const funerals = await prisma.funeralService.findFirst({
      where: { userId: req.user?.id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            validIdUrl: true,
            selfPictureUrl: true,
          },
        },
        bookings: true,
        services: true,
      },
    });
    res.json(funerals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch funerals", error });
  }
};

export const setIsCustomCasket = async (req: Request, res: Response) => {
  try {
    const { isCustom3dCasket } = req.body;
    const funeralId = await getFuneralServiceById(Number(req.user?.id));
    const updatedBooking = await prisma.funeralService.update({
      where: { id: funeralId?.id },
      data: {
        isCustom3dCasket,
      },
    });

    return res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("[Update Booking Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// add available payment
export const createFuneralAvailablePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      paymentInfoImageUrl,
      paymentName,
      paymentType,
      paymentNumber,
    } = req.body;

    const funeralService = await getFuneralServiceById(Number(req.user?.id));
    const newPayment = await prisma.funeralAvailablePayment.create({
      data: {
        paymentInfoImageUrl,
        paymentName,
        paymentType,
        paymentNumber,
        funeralServiceId: Number(funeralService?.id),
      },
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Create FuneralAvailablePayment Error:", error);
    res.status(500).json({ error: "Failed to create payment record." });
  }
};

export const updateFuneralAvailablePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { paymentInfoImageUrl, paymentName, paymentType, paymentNumber } =
      req.body;

    const updatedPayment = await prisma.funeralAvailablePayment.update({
      where: { id: Number(id) },
      data: {
        paymentInfoImageUrl,
        paymentName,
        paymentType,
        paymentNumber,
      },
    });

    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Update FuneralAvailablePayment Error:", error);
    res.status(500).json({ error: "Failed to update payment record." });
  }
};

export const getAllFuneralAvailablePayments = async (
  req: Request,
  res: Response
) => {
  try {
    const funeralService = await getFuneralServiceById(Number(req.user?.id));

    const payments = await prisma.funeralAvailablePayment.findMany({
      where: { funeralServiceId: Number(funeralService?.id) },
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get FuneralAvailablePayments Error:", error);
    res.status(500).json({ error: "Failed to fetch payment records." });
  }
};

export const deleteAvailablePayments = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const payments = await prisma.funeralAvailablePayment.delete({
      where: { id: Number(id) },
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get FuneralAvailablePayments Error:", error);
    res.status(500).json({ error: "Failed to fetch payment records." });
  }
};
