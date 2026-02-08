import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { orderController } from "./order.controller";

const router = express.Router();

router.post("/", auth(UserRole.CUSTOMER), orderController.createOrder);

router.get(
  "/provider",
  auth(UserRole.PROVIDER),
  orderController.getProviderOrders,
);

router.get("/me", auth(UserRole.CUSTOMER), orderController.getMyOrders);

router.get("/:id", auth(UserRole.CUSTOMER), orderController.getOrderById);

router.patch(
  "/:id/status",
  auth(UserRole.PROVIDER),
  orderController.updateOrderStatus,
);

export const orderRouter: Router = router;
