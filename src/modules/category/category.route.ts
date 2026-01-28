import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { CategoryController } from "./category.controller";

const router = Router();

router.post("/", auth(UserRole.ADMIN), CategoryController.createCategory);

router.get("/", CategoryController.getAllCategories);

export const CategoryRoutes = router;
