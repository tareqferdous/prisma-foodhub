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

export const orderRouter: Router = router;
