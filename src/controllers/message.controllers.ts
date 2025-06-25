import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getCustomerById, getFuneralServiceById } from "../services/user.services";

export const sendMessage = async (req: Request, res: Response) => {
  const { conversationId, content, receiverId, attachedImageUrl } = req.body;
  const senderId = req.user?.id;

  try {
    if (!conversationId || !senderId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        attachedImageUrl,
        senderId,
        receiverId: Number(receiverId),
        conversationId: Number(conversationId),
      },
    });

    res.status(200).json({
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessagesByConversation = async (
  req: Request,
  res: Response
) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: Number(conversationId),
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (messages.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(messages );
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


export const getCustomerChatList = async (req: Request, res: Response) => {
  try {
    const customerId = await getCustomerById(Number(req.user?.id));

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customerId?.id,
      },
      include: {
        funeralService: {
          include: {
            funeralAvailablePayments: true,
            user: {
              select: {
                validIdUrl: true,
                selfPictureUrl: true,
              },
            },
          },
        },
        conversation: {
          include: {
            booking: {
              include: {
                serviceBookings: {
                  include: {
                    service: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    console.log("bookings", bookings);

    const customData = bookings?.map((item: any) => ({
      id: item?.conversation?.id,
      name: `${item?.funeralService?.firstName} (${item?.conversation?.booking?.serviceBookings[0]?.service?.name})`,
      bookingStatus: item?.conversation?.booking?.bookingStatus,
      appointmentDate: item?.conversation?.booking?.appointmentDate,
      paymentList: item?.funeralService?.funeralAvailablePayments,
      funeralDocuementId: {
        documentId: item?.funeralService?.user?.validIdUrl,
        selfieImage: item?.funeralService?.user?.selfPictureUrl,
        bussinessPermit: item?.funeralService?.user?.selfPictureUrl,
        sanitaryPermit: item?.funeralService?.user?.selfPictureUrl,
        embalmerLicense: item?.funeralService?.user?.selfPictureUrl,
        profile: item?.funeralService?.user?.profileUrl,
      },
    }));

    return res.status(200).json(customData);
  } catch (error) {
    console.error("[Get Customer Bookings Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

export const getFuneralChatList = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    // const customerId = await getCustomerById(Number(req.user?.id));
    const funeralId = await getFuneralServiceById(Number(req.user?.id));

    const bookings = await prisma.booking.findMany({
      where: { funeralServiceId: funeralId?.id },
      select: {
        conversation: {
          include: {
            booking: {
              include: {
                customer: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    const customData = bookings?.map((item: any) => ({
      id: item?.conversation?.id,
      name: `${item?.conversation?.booking?.customer?.firstName} ${item?.conversation?.booking?.customer?.lastName}`,
      bookingStatus: item?.conversation?.booking?.bookingStatus,
      appointmentDate: item?.conversation?.booking?.appointmentDate,
      customerDocuementId: {
        documentId: item?.conversation?.booking?.customer?.user?.validIdUrl,
        selfieImage:
          item?.conversation?.booking?.customer?.user?.selfPictureUrl,
        profile: item?.conversation?.booking?.customer?.user?.profileUrl,
      },
    }));

    return res.status(200).json(customData);
  } catch (error) {
    console.error("[Get Customer Bookings Error]:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};
