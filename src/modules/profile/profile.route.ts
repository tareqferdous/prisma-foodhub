import { Router } from "express";
import auth from "../../middlewares/auth";
import { profileController } from "./profile.controller";

const router = Router();

router.get("/dashboard", auth(), profileController.getDashboard);
router.get("/recommendations", auth(), profileController.getRecommendations);
router.put("/", auth(), profileController.updateProfile);

export const ProfileRoutes = router;
