import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getCustomerById } from "../services/user.services";

export const createCustomer = async (req: Request, res: Response) => {
  const { firstName, lastName, phone, location } = req.body;  
  try {
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        location,
        phone,
        userId: Number(req.user?.id),
      },
    });

    
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to create customer", error });
  }
};
export const updateCustomer = async (req: Request, res: Response) => {
  const { firstName, lastName, phone,location } = req.body;
  const customerInfo = await getCustomerById(Number(req.user?.id))
  try {
    const customer = await prisma.customer.update({
      where:{id: customerInfo?.id},
      data: {
        firstName,
        lastName,
        phone,
        location
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.log("dd", error);
    
    res.status(500).json({ message: "Failed to create customer", error });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findFirst({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            validIdUrl: true,
            selfPictureUrl:true
          },
        },
      },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers", error });
  }
};

export const getCustomerList = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
            validIdUrl: true,
            selfPictureUrl:true
          },
        },
      },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers", error });
  }
};
