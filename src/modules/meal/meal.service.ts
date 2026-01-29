import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { prisma } from "../../lib/prisma";

interface GetMealsQuery {
  cuisine?: string;
  dietary?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}

type DietaryType = "VEG" | "NON_VEG" | "HALAL";

interface CreateMealInput {
  title: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  dietaryType: DietaryType;
  providerId: string;
}

const createMeal = async (data: CreateMealInput) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) throw new Error("Category not found");

  const provider = await prisma.providerProfile.findUnique({
    where: { id: data.providerId },
  });
  if (!provider) throw new Error("Provider profile not found");

  return prisma.meal.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() ?? null,
      image: data.image?.trim() ?? null,
      price: data.price,
      dietaryType: data.dietaryType,
      categoryId: data.categoryId,
      providerId: data.providerId,
    },
  });
};

const getMeals = async (query: GetMealsQuery) => {
  const { cuisine, dietary, minPrice, maxPrice, search } = query;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationSortingHelper(query);

  const where: any = {
    isAvailable: true,
  };

  if (dietary) {
    where.dietaryType = dietary;
  }

  if (cuisine) {
    where.category = {
      name: {
        equals: cuisine,
        mode: "insensitive",
      },
    };
  }

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  const meals = await prisma.meal.findMany({
    where,
    include: {
      category: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.meal.count({
    where,
  });

  return {
    meals,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMealById = async (id: string) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: { category: true, provider: true, reviews: true },
  });
  if (!meal) {
    const error: any = new Error("Meal not found");
    error.statusCode = 404;
    throw error;
  }
  return meal;
};

export const mealService = {
  createMeal,
  getMeals,
  getMealById,
};
