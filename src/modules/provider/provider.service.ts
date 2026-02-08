import { prisma } from "../../lib/prisma";

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

  const [activeMeals, pendingOrders, deliveredOrders, revenue] =
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
    ]);

  return {
    provider,
    stats: {
      activeMeals: activeMeals,
      pendingOrders: pendingOrders,
      deliveredOrders: deliveredOrders,
      totalRevenue: revenue._sum.totalPrice || 0,
    },
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
