import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const customerId = req.user!.id;

    const review = await reviewService.createReviewService(data, customerId);

    res.status(201).json({ success: true, data: review });
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).json({ success: false, message });
  }
};

const getMealReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { mealId } = req.params;
    const reviews = await reviewService.getMealReviewsService(mealId as string);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};

export const reviewController = {
  createReview,
  getMealReviews,
};
