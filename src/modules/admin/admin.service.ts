import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN",
      },
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

const getAdminStats = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalProviders,
    suspendedUsers,

    totalMeals,
    activeMeals,
    totalCategories,

    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,

    revenue,
  ] = await Promise.all([
    // Users
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),

    // Meals & categories
    prisma.meal.count(),
    prisma.meal.count({ where: { isAvailable: true } }),
    prisma.category.count(),

    // Orders
    prisma.order.count(),
    prisma.order.count({ where: { status: "PLACED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),

    // Revenue
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalPrice: true },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      providers: totalProviders,
      suspended: suspendedUsers,
    },
    meals: {
      total: totalMeals,
      active: activeMeals,
    },
    categories: totalCategories,
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    revenue: revenue._sum.totalPrice || 0,
  };
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllOrders,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getAdminStats,
};
