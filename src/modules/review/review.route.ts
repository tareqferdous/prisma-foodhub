import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { reviewController } from "./review.controller";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), reviewController.createReview);

router.get("/meals/:mealId", reviewController.getMealReviews);

export const reviewRoutes = router;
