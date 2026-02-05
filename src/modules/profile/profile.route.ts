import { Router } from "express";
import auth from "../../middlewares/auth";
import { profileController } from "./profile.controller";

const router = Router();

router.put("/", auth(), profileController.updateProfile);

export const ProfileRoutes = router;
