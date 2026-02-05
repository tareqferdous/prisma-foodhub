import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { mealController } from "./meal.controller";

const router = express.Router();

router.post("/", auth(UserRole.PROVIDER), mealController.createMeal);
router.patch("/", auth(UserRole.PROVIDER), mealController.updateMeal);
router.delete("/:mealId", auth(UserRole.PROVIDER), mealController.deleteMeal);

router.get("/", mealController.getAllMeals);

router.get("/:id", mealController.getMeal);

export const mealRouter: Router = router;
