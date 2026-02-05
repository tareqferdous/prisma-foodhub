import { NextFunction, Request, Response } from "express";
import { ProviderService } from "./provider.service";

const createProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { restaurantName, description, address, phone } = req.body;

    if (!restaurantName || !restaurantName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    const provider = await ProviderService.createProviderProfile({
      restaurantName: restaurantName.trim(),
      description,
      address,
      phone,
      userId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      data: provider,
    });
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const updateProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { restaurantName, description, address, phone } = req.body;
    const provider = await ProviderService.updateProviderProfile(req.user!.id, {
      restaurantName,
      description,
      address,
      phone,
    });

    res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      data: provider,
    });
  } catch (error: any) {
    next(error);
  }
};

const getProviderProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const provider = await ProviderService.getProviderByUserId(req.user!.id);
    res.status(200).json({ success: true, data: provider });
  } catch (error: any) {
    next(error);
  }
};

export const getProvider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const provider = await ProviderService.getProvider(req.params.id as string);
    res.status(200).json({ success: true, data: provider });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const getAllProviders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const providers = await ProviderService.getAllProviders();
    res.status(200).json({ success: true, data: providers });
  } catch (error: any) {
    next(error);
  }
};

const getProviderDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const data = await ProviderService.getProviderDashboard(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const ProviderController = {
  createProvider,
  getProvider,
  getAllProviders,
  updateProvider,
  getProviderProfile,
  getProviderDashboard,
};
