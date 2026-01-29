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

const getMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const meals = await mealService.getMeals(req.query);
    res.status(200).json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};

export const mealController = {
  createMeal,
  getMeals,
};
