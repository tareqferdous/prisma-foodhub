import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = Router();

//dashboard statestics route
router.get("/", auth(UserRole.ADMIN), adminController.getAdminDashboard);

// user management routes
router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.patch(
  "/:userId/status",
  auth(UserRole.ADMIN),
  adminController.updateUserStatus,
);

// order
router.get("/orders", auth(UserRole.ADMIN), adminController.getAllOrders);

// category management route
router.get(
  "/categories",
  auth(UserRole.ADMIN),
  adminController.getAllCategories,
);

router.patch(
  "/categories/:categoryId",
  auth(UserRole.ADMIN),
  adminController.updateCategory,
);
router.delete(
  "/categories/:categoryId",
  auth(UserRole.ADMIN),
  adminController.deleteCategory,
);

export const AdminRoutes = router;
