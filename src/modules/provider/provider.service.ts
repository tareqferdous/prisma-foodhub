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

interface CreateProviderInput {
  restaurantName: string;
  description?: string;
  address?: string;
  phone?: string;
  userId: string;
}

const createProviderProfile = async (data: CreateProviderInput) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId: data.userId },
  });

  if (existing) {
    throw new Error("Provider profile already exists for this user");
  }

  return prisma.providerProfile.create({
    data: {
      restaurantName: data.restaurantName,
      description: data.description ?? null,
      address: data.address ?? null,
      phone: data.phone ?? null,
      userId: data.userId,
    },
  });
};

const updateProviderProfile = async (
  userId: string,
  data: Partial<CreateProviderInput>,
) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId },
  });
  if (!existing) {
    throw new Error("Provider profile does not exist for this user");
  }
  return prisma.providerProfile.update({
    where: { userId },
    data: {
      restaurantName: data.restaurantName ?? existing.restaurantName,
      description: data.description ?? existing.description,
      address: data.address ?? existing.address,
      phone: data.phone ?? existing.phone,
    },
  });
};

const getProviderByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerProfile: {
        include: {
          _count: {
            select: {
              meals: true,
              orders: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.providerProfile) {
    const error: any = new Error("Provider not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    providerProfile: {
      ...user.providerProfile,
      totalMeals: user.providerProfile._count.meals,
      totalOrders: user.providerProfile._count.orders,
    },
  };
};

const getProvider = async (id: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      meals: true,
      orders: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!provider) {
    const error: any = new Error("Provider not found");
    error.statusCode = 404;
    throw error;
  }

  return provider;
};

const getAllProviders = async () => {
  return prisma.providerProfile.findMany({
    include: { meals: true },
    orderBy: { createdAt: "desc" },
  });
};

const getProviderDashboard = async (userId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      meals: {
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      },
      orders: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!provider) {
    const error: any = new Error("Provider not found");
    error.statusCode = 404;
    throw error;
  }

  const [activeMeals, pendingOrders, deliveredOrders, revenue, recentOrders] =
    await Promise.all([
      prisma.meal.count({
        where: {
          providerId: provider.id,
          isAvailable: true,
        },
      }),

      prisma.order.count({
        where: {
          providerId: provider.id,
          status: "PLACED",
        },
      }),

      prisma.order.count({
        where: {
          providerId: provider.id,
          status: "DELIVERED",
        },
      }),
      prisma.order.aggregate({
        where: {
          providerId: provider.id,
          status: "DELIVERED",
        },
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.order.findMany({
        where: {
          providerId: provider.id,
        },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
      }),
    ]);

  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    monthKeys.push(`${date.getFullYear()}-${date.getMonth()}`);
  }

  const orderMonthlyMap = new Map<string, number>();
  const revenueMonthlyMap = new Map<string, number>();

  monthKeys.forEach((key) => {
    orderMonthlyMap.set(key, 0);
    revenueMonthlyMap.set(key, 0);
  });

  provider.orders.forEach((order) => {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    if (!orderMonthlyMap.has(key)) return;

    orderMonthlyMap.set(key, (orderMonthlyMap.get(key) ?? 0) + 1);
    if (order.status === "DELIVERED") {
      revenueMonthlyMap.set(
        key,
        (revenueMonthlyMap.get(key) ?? 0) + Number(order.totalPrice),
      );
    }
  });

  const topMeals = provider.meals
    .map((meal) => ({
      id: meal.id,
      title: meal.title,
      category: meal.category.name,
      price: Number(meal.price),
      isAvailable: meal.isAvailable,
      totalOrders: meal._count?.orderItems ?? 0,
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 8);

  return {
    provider,
    stats: {
      activeMeals: activeMeals,
      pendingOrders: pendingOrders,
      deliveredOrders: deliveredOrders,
      totalRevenue: revenue._sum.totalPrice || 0,
    },
    charts: {
      monthlyOrders: monthKeys.map((key) => {
        const [year, month] = key.split("-").map(Number);
        return {
          label: `${monthLabels[month]} ${String(year).slice(-2)}`,
          value: orderMonthlyMap.get(key) ?? 0,
        };
      }),
      monthlyRevenue: monthKeys.map((key) => {
        const [year, month] = key.split("-").map(Number);
        return {
          label: `${monthLabels[month]} ${String(year).slice(-2)}`,
          value: revenueMonthlyMap.get(key) ?? 0,
        };
      }),
      orderStatus: [
        { label: "Pending", value: pendingOrders },
        { label: "Delivered", value: deliveredOrders },
        {
          label: "Cancelled",
          value: provider.orders.filter((order) => order.status === "CANCELLED")
            .length,
        },
      ],
      mealAvailability: [
        { label: "Active", value: activeMeals },
        {
          label: "Inactive",
          value: Math.max(provider.meals.length - activeMeals, 0),
        },
      ],
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      customerName: order.customer.name,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt,
    })),
    topMeals,
  };
};

export const providerDashboardService = {
  getProviderDashboard,
};

export const ProviderService = {
  createProviderProfile,
  getProvider,
  getAllProviders,
  updateProviderProfile,
  getProviderByUserId,
  getProviderDashboard,
};
