import { AdditionalDetail } from './../../node_modules/.prisma/client/index.d';
import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  getCustomerById,
  getFuneralServiceById,
} from "../services/user.services";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      funeralServiceId,
      selectedServices,
      location,
      appointmentDate,
      casket3DCustom,
      fullPackageId,
      addtionalPackageId,
      hospitalDetails,
    } = req.body;

    const customer = await getCustomerById(Number(req.user?.id));
    const funeral = await getFuneralServiceById(Number(funeralServiceId));
    console.log("test", { customer, funeral });

    if (!funeralServiceId || !location || !appointmentDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: Number(customer?.id),
        funeralServiceId: Number(funeral?.id),
        bookingStatus: "PENDING",
        location,
        appointmentDate,
        hospitalDetails,
        bookingDate: new Date(),
        serviceBookings: {
          create: selectedServices.map((service: any) => ({
            serviceId: service.serviceId,
            selectedCasketDetailId: service.selectedCasketDetailId || null,
            selectedFlowerDetailId: service.selectedFlowerDetailId || null,
          })),
        },
        conversation: {
          create: {},
        },
        ...(casket3DCustom
          ? {
              customCasketDetail: {
                create: {
                  material: casket3DCustom.material,
                  color: casket3DCustom.color,
                  width: casket3DCustom.width,
                  length: casket3DCustom.length,
                  height: casket3DCustom.height,
                  additionalCost: casket3DCustom.additionalCost,
                },
              },
            }
          : {}),
        ...(fullPackageId ? { fullPackageId: Number(fullPackageId) } : {}),
        ...(Array.isArray(addtionalPackageId) && addtionalPackageId.length > 0
          ? {
              additionalBookings: {
                create: addtionalPackageId.map((id: number) => ({
                  additionalId: id,
                })),
              },
            }
          : {}),
      },
      include: {
        serviceBookings: {
          include: {
            service: true,
          },
        },
        conversation: true,
      },
    });

    const servicesByType = booking.serviceBookings.reduce(
      (acc: Record<string, string[]>, sb) => {
        const type = sb.service.serviceType.toLowerCase();
        if (!acc[type]) acc[type] = [];
        acc[type].push(sb.service.name);
        return acc;
      },
      {}
    );

    let orderDetails = `Thank you Customer, your order is confirmed.\n`;
    orderDetails += `- appointmentDate: ${booking.appointmentDate}\n`;
    orderDetails += `- status: ${booking.bookingStatus}\n\n`;
    orderDetails += `Your order:\n\n`;

    for (const [type, names] of Object.entries(servicesByType)) {
      orderDetails += `${capitalize(type)}\n`;
      names.forEach((n) => (orderDetails += `* ${n}\n`));
      orderDetails += `\n`;
    }

    await prisma.message.create({
      data: {
        content: orderDetails.trim(),
        senderId: Number(funeralServiceId),
        receiverId: Number(req.user?.id),
        conversationId: booking.conversation?.id as number,
      },
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error("[Create Booking Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getCustomerBookings = async (req: Request, res: Response) => {
  try {
    const customerId = await getCustomerById(Number(req.user?.id));

    const bookings = await prisma.booking.findMany({
      where: { customerId: customerId?.id },
      include: {
        funeralService: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        serviceBookings: {
          include: {
            service: true,
            selectedCasketDetail: true,
            selectedFlowerDetail: true,
          },
        },
        customCasketDetail: true,
        conversation: {
          include: {
            messages: true,
          },
        },
        fullPackage: {
          include: {
            details: true,
          },
        },

        additionalBookings: {
          include: {
            additional: true,
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

// 3. Get Booking By ID (for Customer)
export const getCustomerBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.bookingId);

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
      include: {
        funeralService: true,
        serviceBookings: {
          include: {
            service: true,
            selectedCasketDetail: true,
            selectedFlowerDetail: true,
          },
        },
        conversation: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("[Get Customer Booking Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// 4. Update Booking Status and Location (for Funeral Service)
export const updateBookingStatusAndLocation = async (
  req: Request,
  res: Response
) => {
  try {
    const funeralServiceId = await getFuneralServiceById(Number(req.user?.id));
    const bookingId = Number(req.params.bookingId);
    const { bookingStatus, location } = req.body;

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        funeralServiceId: funeralServiceId?.id,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus,
        location,
      },
    });

    return res.status(200).json(updatedBooking);
  } catch (error) {
    console.error("[Update Booking Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// 5. Get All Customer Bookings (for Funeral Service Owner)
export const getFuneralServiceBookings = async (
  req: Request,
  res: Response
) => {
  try {
    const funeralServiceId = await getFuneralServiceById(Number(req.user?.id));

    const bookings = await prisma.booking.findMany({
      where: { funeralServiceId: funeralServiceId?.id },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        fullPackage: {
          include: {
            details: true,
          },
        },
        serviceBookings: {
          include: {
            service: true,
            selectedCasketDetail: true,
            selectedFlowerDetail: true,
          },
        },
        customCasketDetail: true,
        conversation: {
          include: {
            messages: true,
          },
        },

        // ✅ include many-to-many additional packages
        additionalBookings: {
          include: {
            additional: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("[Get Funeral Service Bookings Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};


// 6. Get Bookings by Customer ID (for Funeral Service View Specific Customer)
export const getBookingsByCustomerId = async (req: Request, res: Response) => {
  try {
    const funeralServiceId = await getFuneralServiceById(Number(req.user?.id));
    const customerId = Number(req.params.customerId);

    const bookings = await prisma.booking.findMany({
      where: {
        funeralServiceId: funeralServiceId?.id,
        customerId,
      },
      include: {
        fullPackage:true,
        serviceBookings: {
          include: {
            service: true,
            selectedCasketDetail: true,
            selectedFlowerDetail: true,
          },
        },
        conversation: {
          include: {
            messages: true,
          },
        },
      },
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("[Get Bookings by Customer ID Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

