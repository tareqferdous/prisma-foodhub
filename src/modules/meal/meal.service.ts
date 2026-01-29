import { prisma } from "../../lib/prisma";

interface GetMealsQuery {
  cuisine?: string;
  dietary?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
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
  console.log("data", data);
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

  return prisma.meal.findMany({
    where,
    include: {
      category: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const mealService = {
  createMeal,
  getMeals,
};
