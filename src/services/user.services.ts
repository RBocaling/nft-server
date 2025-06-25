import prisma from "../config/prisma";

export const getCustomerById = async (userId:number) => {
  try {
    const response = await prisma.customer.findFirst({
      where: { userId },
    });
    return response
  } catch (error) {
      throw new Error("get customer")
  }
};

export const getFuneralServiceById = async (userId:number) => {
  try {
    const response = await prisma.funeralService.findFirst({
      where: { userId },
    });
    return response
  } catch (error) {
      throw new Error("get customer")
  }
};
