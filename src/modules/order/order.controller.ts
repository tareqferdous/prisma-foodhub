import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { orderService } from "./order.service";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.createOrder({
      customerId: req.user!.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

const getProviderOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(403).json({ message: "Provider profile not found" });
    }

    const providerId = provider.id;
    const orders = await orderService.getProviderOrders(providerId);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user!.id;
    const orders = await orderService.getCustomerOrders(customerId);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!provider) {
      return res.status(403).json({ message: "Provider profile not found" });
    }

    const updateOrderStatus = await orderService.updateOrderStatus(
      id as string,
      status,
      provider.id,
    );
    res.status(200).json({
      success: true,
      data: updateOrderStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getProviderOrders,
  getMyOrders,
  updateOrderStatus,
};
