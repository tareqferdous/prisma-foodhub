import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { mealService } from "./meal.service";

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, price, image, categoryId, dietaryType } =
      req.body;

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(403).json({
        success: false,
        message: "Provider not found. Create profile first.",
      });
    }

    const meal = await mealService.createMeal({
      title,
      description,
      price,
      image,
      categoryId,
      dietaryType,
      providerId: provider.id,
    });

    res.status(201).json({ success: true, data: meal });
  } catch (err: any) {
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    next(err);
  }
};

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meals = await mealService.getMeals(req.query as any);
    res.status(200).json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};

const getMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meal = await mealService.getMealById(req.params.id as string);
    res.status(200).json({ success: true, data: meal });
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

const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const data = req.body;

    const meal = await mealService.updateMeal(userId, data);

    res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { mealId } = req.params;

    await mealService.deleteMeal(userId, mealId as string);

    res.status(200).json({
      success: true,
      message: "Meal removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const mealController = {
  createMeal,
  getAllMeals,
  getMeal,
  updateMeal,
  deleteMeal,
};
