import { NextFunction, Request, Response } from "express";
import { profileService } from "./profile.service";

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { name, image } = req.body;
    const updatedProfile = await profileService.updateUserProfile(
      userId,
      name,
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

export const profileController = {
  updateProfile,
};
