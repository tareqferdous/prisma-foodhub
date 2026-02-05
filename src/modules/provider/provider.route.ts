import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { ProviderController } from "./provider.controller";

const router = Router();

router.post("/", auth(UserRole.PROVIDER), ProviderController.createProvider);
router.put("/", auth(UserRole.PROVIDER), ProviderController.updateProvider);
router.get(
  "/dashboard",
  auth(UserRole.PROVIDER),
  ProviderController.getProviderDashboard,
);

router.get(
  "/profile",
  auth(UserRole.PROVIDER),
  ProviderController.getProviderProfile,
);
router.get("/", ProviderController.getAllProviders);
router.get("/:id", ProviderController.getProvider);

export const ProviderRoutes = router;
