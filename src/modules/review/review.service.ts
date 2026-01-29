import { prisma } from "../../lib/prisma";

const createReviewService = async (input: any, customerId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });
  if (!order) throw { statusCode: 404, message: "Order not found" };

  if (order.customerId !== customerId) {
    throw { statusCode: 403, message: "You can only review your own orders" };
  }
  const review = await prisma.review.create({
    data: {
      orderId: input.orderId,
      mealId: input.mealId,
      rating: input.rating,
      comment: input.comment,
    },
  });

  return review;
};

const getMealReviewsService = async (mealId: string) => {
  return prisma.review.findMany({
    where: { mealId },
    include: {
      order: { select: { customer: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewService = {
  createReviewService,
  getMealReviewsService,
};
