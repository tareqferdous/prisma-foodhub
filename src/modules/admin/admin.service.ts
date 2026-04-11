import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getLastSixMonthKeys = () => {
  const today = new Date();
  const keys: string[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(`${date.getFullYear()}-${date.getMonth()}`);
  }

  return keys;
};

const toMonthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  return `${monthLabels[month]} ${String(year).slice(-2)}`;
};

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
  const sixMonthKeys = getLastSixMonthKeys();
  const sixMonthStart = new Date();
  sixMonthStart.setMonth(sixMonthStart.getMonth() - 5);
  sixMonthStart.setDate(1);
  sixMonthStart.setHours(0, 0, 0, 0);

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
    recentOrders,
    sixMonthOrders,
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
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        provider: {
          select: {
            restaurantName: true,
          },
        },
      },
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixMonthStart,
        },
      },
      select: {
        createdAt: true,
        status: true,
        totalPrice: true,
      },
    }),
  ]);

  const monthlyOrderMap = new Map<string, number>();
  const monthlyRevenueMap = new Map<string, number>();

  sixMonthKeys.forEach((key) => {
    monthlyOrderMap.set(key, 0);
    monthlyRevenueMap.set(key, 0);
  });

  sixMonthOrders.forEach((order) => {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;

    if (!monthlyOrderMap.has(key)) {
      return;
    }

    monthlyOrderMap.set(key, (monthlyOrderMap.get(key) ?? 0) + 1);

    if (order.status === "DELIVERED") {
      monthlyRevenueMap.set(
        key,
        (monthlyRevenueMap.get(key) ?? 0) + Number(order.totalPrice),
      );
    }
  });

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
    charts: {
      monthlyOrders: sixMonthKeys.map((key) => ({
        label: toMonthLabel(key),
        value: monthlyOrderMap.get(key) ?? 0,
      })),
      monthlyRevenue: sixMonthKeys.map((key) => ({
        label: toMonthLabel(key),
        value: monthlyRevenueMap.get(key) ?? 0,
      })),
      orderStatus: [
        { label: "Pending", value: pendingOrders },
        { label: "Delivered", value: deliveredOrders },
        { label: "Cancelled", value: cancelledOrders },
      ],
      userDistribution: [
        { label: "Customers", value: totalCustomers },
        { label: "Providers", value: totalProviders },
        {
          label: "Admins",
          value: Math.max(totalUsers - totalCustomers - totalProviders, 0),
        },
      ],
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customer.name,
      providerName: order.provider.restaurantName,
      status: order.status,
      totalPrice: Number(order.totalPrice),
    })),
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
