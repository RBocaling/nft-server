import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getFuneralServiceById } from "../services/user.services";

const VALID_SERVICE_TYPES = ["CASKET", "FLOWERS", "RENT_MEMORIAL","FULL_PACKAGE"] as const;

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, price, serviceType, details } = req.body;
    const funeralServiceId = await getFuneralServiceById(Number(req.user?.id));

    if (!name || !description || !price || !serviceType) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!VALID_SERVICE_TYPES.includes(serviceType)) {
      return res.status(400).json({ message: "Invalid service type." });
    }

      console.log("funeralServiceId?.id",Number(req.user?.id));
      
    const data: any = {
      funeralServiceId: funeralServiceId?.id,
      name,
      description,
      price: 1,
      serviceType,
    };

    if (serviceType === "CASKET" && details?.length) {
      data.casketDetails = {
        create: details.map((casket: any) => ({
          color: casket.color,
          width: casket.width,
          height: casket.height,
          casketType: casket.casketType,
          price: casket.price,
          imgUrl: casket.imgUrl,
        })),
      };
    }

    if (serviceType === "FLOWERS" && details?.length) {
      data.flowerDetails = {
        create: details.map((flower: any) => ({
          color: flower.color,
          size: flower.size,
          flowerType: flower.flowerType,
          price: flower.price,
          imgUrl: flower.imgUrl,
        })),
      };
    }

    const service = await prisma.service.create({
      data,
      include: {
        casketDetails: true,
        flowerDetails: true,
      },
    });

    return res.status(201).json(service);
  } catch (error) {
    console.error("[Create Service Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
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
        },
      });
    } else if (serviceType === "FLOWERS") {
      createdDetail = await prisma.flowerDetail.create({
        data: {
          serviceId: serviceId,
          size: detail.size,
          flowerType: detail.flowerType,
          price: detail.price,
        },
      });
    } else if (serviceType === "FULL_PACKAGE") {
        createdDetail = await prisma.fullPackage.create({
          data: {
            serviceId: serviceId,
            title: detail.title,
            imageUrl: detail.imageUrl,
            price: detail.price,
            details: {
              create: detail.details.map((detail: { description: string }) => ({
                description: detail.description,
              })),
            },
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

export const getMyServices = async (req: Request, res: Response) => {
  try {
    const funeralService = await getFuneralServiceById(Number(req.user?.id));

    const myServices = await prisma.service.findMany({
      where: { funeralServiceId: funeralService?.id },
      include: {
        casketDetails: true,
        flowerDetails: true,
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
          },
        },
      },
    });

    return res.status(200).json(myServices);
  } catch (error) {
    console.error("[Get My Services Error]:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
