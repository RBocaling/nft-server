import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  uploadDocuments,
  userInfo,
} from "../services/auth.services";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import {
  getCustomerById,
  getFuneralServiceById,
} from "../services/user.services";
import prisma from "../config/prisma";
import { randomToken } from "../utils/randomToken";
import { sendVerificationEmail } from "../services/email-verification.services";

export const register = async (req: Request, res: Response) => {
  const { email, password, role, username } = req.body;
 const token = randomToken()

  try {

    const user = await registerUser(email, password, role, username, token.toString(), false);
    if (!user) throw new Error("failed register");

    await sendVerificationEmail(email, token.toString(),role);

    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (error: any) {
    res.status(400).json({ message: "" });
  }
};
export const emailVerify = async (req: Request, res: Response) => {

  
 const { token, role } = req.query;

    const link = role === "CUSTOMER" ? "https://www.funeral-customer.site": "https://www.funeral-service.site";
// const link = "http://localhost:5000"

  if(!token) throw new Error("no token")
  const user = await prisma.user.findFirst({
    where: { isEmailCode: token?.toString() }
  });

  if (!user) {
    return res.status(400).send('Invalid or expired token.');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerification: true,
      isEmailCode: null
    }
  });

  res.redirect(link);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken,isEmailVerify } = await loginUser(email, password);

    res.status(201).json({
      accessToken,
      refreshToken,
      isEmailVerify
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken(decoded.id, decoded.role);
    const newRefreshToken = generateRefreshToken(decoded.id);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const uploadDocumentId = async (req: Request, res: Response) => {
  const {
    validIdUrl,
    selfPictureUrl,
    profileUrl,
    bussinessPermit,
    sanitaryPermit,
    embalmerLicense,
  } = req.body;

  try {
    const response = await uploadDocuments({
      validIdUrl,
      selfPictureUrl,
      id: Number(req.user?.id),
      profileUrl,
    bussinessPermit,
      sanitaryPermit,
      embalmerLicense,
    });
    res.status(201).json({ message: "Document Upload", data: response });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const getUserAuth = async (req: Request, res: Response) => {
  try {
    const response = await userInfo(Number(req.user?.id));

    res.status(201).json({ message: "UnAuthorized", data: response });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const getUserList = async (req: Request, res: Response) => {
  try {
    const response = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        role: true,
      },
    });

    res.status(201).json(response);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

// for customer
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const user = await userInfo(Number(req.user?.id));
    const customer = await getCustomerById(Number(req.user?.id));
    const personalRequirement = !!(
      user &&
      customer?.firstName &&
      customer?.lastName &&
      customer?.phone
    );
    const documentRequirement = !!(
      user &&
      user?.validIdUrl &&
      user?.selfPictureUrl
    );

    const userProgress = [
      {
        id: "personal",
        title: "Complete Personal Information",
        description: "First name, Last name Etc.",
        completed: personalRequirement,
      },
      {
        id: "documents",
        title: "Upload Valid ID, Selfie Picture",
        description: "ID card, Passport, or Driver's license",
        completed: documentRequirement,
      },
    ];

    res.status(201).json(userProgress);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
// for customer
export const getFuneralProgress = async (req: Request, res: Response) => {
  try {
    const user = await userInfo(Number(req.user?.id));
    const funeralService = await getFuneralServiceById(Number(req.user?.id));
    const personalRequirement = !!(
      user &&
      funeralService?.firstName &&
      funeralService?.lastName &&
      funeralService?.phone &&
      funeralService?.location &&
      funeralService?.funeralName
    );
    const documentRequirement = !!(
      user &&
      user?.validIdUrl &&
      user?.bussinessPermit &&
      user?.sanitaryPermit &&
      user?.embalmerLicense 

    );

    const userProgress = [
      {
        id: "personal",
        title: "Complete Personal Information",
        description: "First name, Last name Etc.",
        completed: personalRequirement,
      },
      {
        id: "documents",
        title: "Upload Valid ID, Selfie Picture",
        description: "ID card, Passport, or Driver's license",
        completed: documentRequirement,
      },
    ];

    res.status(201).json(userProgress);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
