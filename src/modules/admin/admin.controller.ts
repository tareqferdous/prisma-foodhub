import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const updatedUser = await adminService.updateUserStatus(
      userId as string,
      status,
    );
    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await adminService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await adminService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.params;
    const category = await adminService.updateCategory(
      categoryId as string,
      req.body,
    );
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.params;
    await adminService.deleteCategory(categoryId as string);
    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
