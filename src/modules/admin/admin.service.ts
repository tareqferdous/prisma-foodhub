import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: { items: true, reviews: true },
    orderBy: { createdAt: "desc" },
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
};

const updateCategory = async (categoryId: string, data: { name: string }) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw new Error("Category not found");

  return await prisma.category.update({ where: { id: categoryId }, data });
};

const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw new Error("Category not found");

  // soft delete if needed
  return await prisma.category.delete({ where: { id: categoryId } });
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
