import { prisma } from "../../lib/prisma";

const createReviewService = async (input: any, customerId: string) => {
  const { orderId, mealId, rating, comment } = input;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw { statusCode: 404, message: "Order not found" };
  }

  if (order.customerId !== customerId) {
    throw {
      statusCode: 403,
      message: "You can only review your own orders",
    };
  }

  const mealInOrder = order.items.some((item) => item.mealId === mealId);

  if (!mealInOrder) {
    throw {
      statusCode: 400,
      message: "This meal was not part of the order",
    };
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      orderId_mealId: {
        orderId,
        mealId,
      },
    },
  });

  if (existingReview) {
    throw {
      statusCode: 400,
      message: "You have already reviewed this meal for this order",
    };
  }

  const review = await prisma.review.create({
    data: {
      orderId,
      mealId,
      rating,
      comment,
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
