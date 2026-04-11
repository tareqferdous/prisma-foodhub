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

const updateUserProfile = async (
  userId: string,
  name: string,
  email?: string,
  image: string,
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      ...(email ? { email } : {}),
      image,
    },
  });
  return updatedUser;
};

const getCustomerDashboard = async (userId: string) => {
  const sixMonthKeys = getLastSixMonthKeys();
  const sixMonthStart = new Date();
  sixMonthStart.setMonth(sixMonthStart.getMonth() - 5);
  sixMonthStart.setDate(1);
  sixMonthStart.setHours(0, 0, 0, 0);

  const [allOrders, recentOrders, recentForChart] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: userId },
      select: {
        status: true,
        totalPrice: true,
      },
    }),
    prisma.order.findMany({
      where: { customerId: userId },
      include: {
        provider: {
          select: {
            restaurantName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.order.findMany({
      where: {
        customerId: userId,
        createdAt: {
          gte: sixMonthStart,
        },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  const monthlyMap = new Map<string, number>();
  sixMonthKeys.forEach((key) => monthlyMap.set(key, 0));

  recentForChart.forEach((order) => {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    if (!monthlyMap.has(key)) return;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
  });

  const deliveredOrders = allOrders.filter(
    (order) => order.status === "DELIVERED",
  );

  return {
    overview: {
      totalOrders: allOrders.length,
      activeOrders: allOrders.filter((order) => order.status === "PLACED")
        .length,
      deliveredOrders: deliveredOrders.length,
      totalSpent: deliveredOrders.reduce(
        (acc, order) => acc + Number(order.totalPrice),
        0,
      ),
    },
    monthlyOrders: sixMonthKeys.map((key) => {
      const [year, month] = key.split("-").map(Number);
      return {
        label: `${monthLabels[month]} ${String(year).slice(-2)}`,
        value: monthlyMap.get(key) ?? 0,
      };
    }),
    statusDistribution: [
      {
        label: "Pending",
        value: allOrders.filter((order) => order.status === "PLACED").length,
      },
      {
        label: "Delivered",
        value: deliveredOrders.length,
      },
      {
        label: "Cancelled",
        value: allOrders.filter((order) => order.status === "CANCELLED").length,
      },
    ],
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      createdAt: order.createdAt,
      providerName: order.provider.restaurantName,
    })),
  };
};

const getMealRecommendations = async (userId: string) => {
  const recentOrderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        customerId: userId,
      },
    },
    select: {
      mealId: true,
      quantity: true,
      meal: {
        select: {
          categoryId: true,
          providerId: true,
          dietaryType: true,
        },
      },
    },
    orderBy: {
      order: {
        createdAt: "desc",
      },
    },
    take: 120,
  });

  const includeMealShape = {
    category: true,
    reviews: true,
    provider: {
      select: {
        id: true,
        restaurantName: true,
      },
    },
    _count: {
      select: {
        orderItems: true,
      },
    },
  } as const;

  if (recentOrderItems.length === 0) {
    const popularMeals = await prisma.meal.findMany({
      where: { isAvailable: true },
      include: includeMealShape,
      orderBy: [
        {
          orderItems: {
            _count: "desc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
      take: 4,
    });

    return popularMeals.map(({ _count, ...meal }) => ({
      ...meal,
      recommendationScore: Number(
        (Math.min(_count.orderItems, 20) * 0.3).toFixed(2),
      ),
    }));
  }

  const orderedMealIds = new Set<string>();
  const categoryWeight = new Map<string, number>();
  const providerWeight = new Map<string, number>();
  const dietaryWeight = new Map<string, number>();

  for (const item of recentOrderItems) {
    const quantity = item.quantity ?? 1;
    orderedMealIds.add(item.mealId);

    if (item.meal.categoryId) {
      categoryWeight.set(
        item.meal.categoryId,
        (categoryWeight.get(item.meal.categoryId) ?? 0) + quantity * 3,
      );
    }

    if (item.meal.providerId) {
      providerWeight.set(
        item.meal.providerId,
        (providerWeight.get(item.meal.providerId) ?? 0) + quantity * 2,
      );
    }

    if (item.meal.dietaryType) {
      dietaryWeight.set(
        item.meal.dietaryType,
        (dietaryWeight.get(item.meal.dietaryType) ?? 0) + quantity * 1.5,
      );
    }
  }

  const candidates = await prisma.meal.findMany({
    where: {
      isAvailable: true,
      id: {
        notIn: Array.from(orderedMealIds).slice(0, 40),
      },
    },
    include: includeMealShape,
    take: 30,
  });

  const scoredMeals = candidates
    .map((meal) => {
      const avgRating = meal.reviews.length
        ? meal.reviews.reduce((sum, review) => sum + review.rating, 0) /
          meal.reviews.length
        : 0;

      const score =
        (categoryWeight.get(meal.categoryId) ?? 0) +
        (providerWeight.get(meal.providerId) ?? 0) +
        (dietaryWeight.get(meal.dietaryType) ?? 0) +
        Math.min(meal._count.orderItems, 20) * 0.3 +
        avgRating * 0.5;

      return {
        ...meal,
        recommendationScore: Number(score.toFixed(2)),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 4)
    .map(({ _count, ...meal }) => meal);

  return scoredMeals;
};

export const profileService = {
  getCustomerDashboard,
  getMealRecommendations,
  updateUserProfile,
};
