import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getFuneralServiceById } from "../services/user.services";

const VALID_SERVICE_TYPES = ["CASKET", "FLOWERS", "RENT_MEMORIAL", "FULL_PACKAGE", "ADDITIONAL"] as const;

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, serviceType, imgUrl,detail ,price, additionalDetail} = req.body;
    const funeralServiceId = await getFuneralServiceById(Number(req.user?.id));

    if (!name || !description || !serviceType) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!VALID_SERVICE_TYPES.includes(serviceType)) {
      return res.status(400).json({ message: "Invalid service type." });
    }

   
    
    const service = await prisma.service.create({
      data: {
        funeralServiceId: Number(funeralServiceId?.id),
        name,
        description,
        serviceType,
        imgUrl,
        fullPacakge: detail && detail.length > 0 ? {
          create: {
            title: name,
            imageUrl: imgUrl,
            price: price,
            details: {
              create: detail.map((d: { description: string }) => ({
                description: d.description,
              })),
            },
          }
        } : undefined,
        additionalDetails: serviceType ==="ADDITIONAL" ?
          {
            create: {
              description,
              price,
              additionalImageUrl:imgUrl
            }
          }:undefined
      },
    });
    
    return res.status(201).json(service);
  } catch (error) {
    console.error("[Create Service Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const serviceId = Number(req.params.serviceId);

    if (!serviceId) {
      return res.status(400).json({ message: "Missing service ID." });
    }
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found." });
    }

    const deletedService = await prisma.$transaction(async (tx) => {
      await tx.casketDetail.deleteMany({ where: { serviceId } });
      await tx.flowerDetail.deleteMany({ where: { serviceId } });

      return tx.service.delete({ where: { id: serviceId } });
    });

    return res.status(200).json({
      message: "Service and related details deleted successfully.",
      deletedService,
    });

  } catch (error: any) {
    console.error("[Delete Service Error]:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while deleting the service.",
    });
  }
};

export const addServiceDetail = async (req: Request, res: Response) => {
  try {
    const { detail, serviceType } = req.body;

    const serviceId = Number(req.params?.serviceId);

    if (!serviceId || !detail) {
      return res.status(400).json({ message: "Missing serviceId or detail." });
    }

    let createdDetail;

    if (serviceType === "CASKET") {
      createdDetail = await prisma.casketDetail.create({
        data: {
          serviceId: serviceId,
          color: detail.color,
          size: detail.size,
          casketType: detail.casketType,
          price: detail.price,
          image_url: detail.image_url,
        },
      });
    } else if (serviceType === "FLOWERS") {
      createdDetail = await prisma.flowerDetail.create({
        data: {
          serviceId: serviceId,
          size: detail.size,
          flowerType: detail.flowerType,
          image_url: detail.image_url,
          price: detail.price,
        },
      });
    } else if (serviceType === "ADDITIONAL") {
      createdDetail = await prisma.additionalDetail.create({
        data: {
          serviceId: serviceId,
          additionalImageUrl: detail.additionalImageUrl,
          price: detail.price,
          description: detail.description,
        },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Cannot add details to this service type." });
    }

    return res
      .status(201)
      .json({ message: "Detail added successfully.", createdDetail });
  } catch (error) {
    console.error("[Add Service Detail Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteDetails = async (req: Request, res: Response) => {
  try {
    const serviceType = req.params.serviceType?.toUpperCase();
    const detailId = Number(req.params.detailId);

    if (!serviceType || !detailId) {
      return res.status(400).json({ message: "Missing serviceType or detailId." });
    }

    let deletedDetail;

    if (serviceType === "CASKET") {
      deletedDetail = await prisma.casketDetail.delete({
        where: { id: detailId },
      });
    } else if (serviceType === "FLOWERS") {
      deletedDetail = await prisma.flowerDetail.delete({
        where: { id: detailId },
      });
    } else {
      return res
        .status(400)
        .json({ message: "Cannot delete details from this service type." });
    }

    return res
      .status(200)
      .json({ message: "Detail deleted successfully.", deletedDetail });
  } catch (error) {
    console.error("[Delete Service Detail Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const getMyServices = async (req: Request, res: Response) => {
  try {
    const funeralService = await getFuneralServiceById(Number(req.user?.id));

    const myServices = await prisma.service.findMany({
      where: { funeralServiceId: funeralService?.id },
      include: {
        casketDetails: true,
        flowerDetails: true,
        additionalDetails:true,
        fullPacakge: {
          include: {
            details:true
          }
        }
      },
    });

    return res.status(200).json(myServices);
  } catch (error) {
    console.error("[Get My Services Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const myServices = await prisma.funeralService.findMany({
      include: {
        services: {
          include: {
            casketDetails: true,
            flowerDetails: true,
            additionalDetails:true,
            fullPacakge: {
              include: {
                details:true
              }
            }
          },
        },
        user: {
          select: {
            email:true,
            
          }
        }
      },
    });

    return res.status(200).json(myServices);
  } catch (error) {
    console.error("[Get My Services Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
