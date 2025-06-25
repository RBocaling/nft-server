import argon2 from "argon2";
import prisma from "../config/prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

export const registerUser = async (
  email: string,
  password: string,
  role: "CUSTOMER" | "FUNERAL_SERVICE" | "ADMIN",
  username: string,
  isEmailCode: any,
  isEmailVerification:boolean

) => {
  const hashedPassword = await argon2.hash(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      username,
      isEmailCode,
      isEmailVerification
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await argon2.verify(user.password, password))) {
    throw new Error("Invalid credentials");
  }

  return {
    accessToken: generateAccessToken(user.id, user.role),
    refreshToken: generateRefreshToken(user.id),
    isEmailVerify:user?.isEmailVerification
  };
};
export const uploadDocuments = async ({
  id,
  profileUrl,
  selfPictureUrl,
  validIdUrl,
  bussinessPermit,
  sanitaryPermit,
  embalmerLicense,
}: {
  validIdUrl?: string;
  selfPictureUrl?: string;
  profileUrl?: string;
  id: number;
  bussinessPermit?: string;
  sanitaryPermit?: string;
  embalmerLicense?: string;
}) => {
  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        validIdUrl,
        selfPictureUrl,
        profileUrl,
        bussinessPermit,
        sanitaryPermit,
        embalmerLicense,
      },
    });

    return user;
  } catch (error) {}
};
export const userInfo = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        validIdUrl: true,
        selfPictureUrl: true,
        profileUrl: true,
        bussinessPermit: true,
        sanitaryPermit: true,
        embalmerLicense:true
      },
    });

    return user;
  } catch (error) {}
};
