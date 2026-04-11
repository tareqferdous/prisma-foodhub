import { NextFunction, Request, Response } from "express";
import { profileService } from "./profile.service";

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { name, image, email } = req.body;
    const updatedProfile = await profileService.updateUserProfile(
      userId,
      name,
      email,
      image,
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const dashboard = await profileService.getCustomerDashboard(userId);
    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const recommendations = await profileService.getMealRecommendations(userId);
    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const profileController = {
  getDashboard,
  getRecommendations,
  updateProfile,
};
