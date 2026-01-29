import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { mealController } from "./meal.controller";

const router = express.Router();

router.post("/", auth(UserRole.PROVIDER), mealController.createMeal);

router.get("/", mealController.getMeals);

export const mealRouter: Router = router;
