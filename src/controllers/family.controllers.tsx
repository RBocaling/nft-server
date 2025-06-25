import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getCustomerById } from "../services/user.services";

export const addCustomerFamily = async (req: Request, res: Response) => {
  try {
    const { familyMemberCustomerId, relation, description } = req.body;

    const owner = await getCustomerById(Number(req?.user?.id))

    if (!owner) {
      return res.status(404).json({ message: "Owner customer not found" });
    }

    const newFamily = await prisma.familyCustomer.create({
      data: {
        ownerCustomerId: owner.id,
        familyMemberCustomerId,
        relation,
        description,
      },
    });

    res.json(newFamily);
  } catch (error) {
    res.status(500).json({ message: "Failed to add family member", error });
  }
};

export const updateCustomerFamily = async (req: Request, res: Response) => {
  try {
    const { id, relation, description } = req.body;

    const updatedFamily = await prisma.familyCustomer.update({
      where: { id },
      data: {
        relation,
        description,
      },
    });

    res.json(updatedFamily);
  } catch (error) {
    res.status(500).json({ message: "Failed to update family member", error });
  }
};

export const deleteCustomerFamily = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.familyCustomer.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Family member deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete family member", error });
  }
};

export const getCustomerFamily = async (req: Request, res: Response) => {
  try {
    const customer =await getCustomerById(Number(req?.user?.id))

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const familyList = await prisma.familyCustomer.findMany({
      where: { ownerCustomerId: customer.id },
      include: {
        familyMemberCustomer: {
          include: {
            user: {
              select: {
                profileUrl: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json(familyList);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch family list", error });
  }
};
