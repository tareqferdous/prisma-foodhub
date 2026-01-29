import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface CreateOrderInput {
  customerId: string;
  providerId: string;
  deliveryAddress: string;
  items: {
    mealId: string;
    quantity: number;
  }[];
}

const createOrder = async (data: CreateOrderInput) => {
  return await prisma.$transaction(async (tx) => {
    // fetch meals from DB
    const mealIds = data.items.map((item) => item.mealId);
    const meals = await tx.meal.findMany({
      where: { id: { in: mealIds }, isAvailable: true },
    });

    //calculate total price and prepare order items
    let totalPrice = 0;
    const orderItemsData = data.items.map((item) => {
      const meal = meals.find((m) => m.id === item.mealId)!;
      const itemTotal = Number(meal.price) * item.quantity;
      totalPrice += itemTotal;

      return {
        mealId: meal.id,
        quantity: item.quantity,
        price: meal.price,
      };
    });

    // create order
    const order = await tx.order.create({
      data: {
        customerId: data.customerId,
        providerId: data.providerId,
        deliveryAddress: data.deliveryAddress,
        totalPrice,
        status: OrderStatus.PLACED,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });
    return order;
  });
};

const getProviderOrders = async (providerId: string) => {
  const result = await prisma.order.findMany({
    where: { providerId },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
      customer: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getCustomerOrders = async (customerId: string) => {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
      provider: {
        select: { id: true, restaurantName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  providerId: string,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.providerId !== providerId) {
    throw new Error("Forbidden: Not your order");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

export const orderService = {
  createOrder,
  getProviderOrders,
  getCustomerOrders,
  updateOrderStatus,
};
