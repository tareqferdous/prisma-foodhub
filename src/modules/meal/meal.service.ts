import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { prisma } from "../../lib/prisma";

interface GetMealsQuery {
  cuisine?: string;
  dietary?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: string;
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

interface GenerateDescriptionInput {
  title: string;
  keyPoints?: string;
  categoryName?: string;
  dietaryType?: DietaryType;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

const fallbackDescription = ({
  title,
  keyPoints,
  categoryName,
  dietaryType,
}: GenerateDescriptionInput) => {
  const parts: string[] = [];

  if (categoryName) parts.push(`${categoryName} category`);
  if (dietaryType) parts.push(`${dietaryType.replace("_", " ")} option`);

  const meta = parts.length ? ` in our ${parts.join(", ")}` : "";
  const keyPointText = keyPoints?.trim()
    ? ` Crafted with ${keyPoints.trim().toLowerCase()}.`
    : " Prepared fresh with quality ingredients for a rich, satisfying taste.";

  return `${title} is a flavorful signature dish${meta}.${keyPointText} Perfect for customers who want balanced taste, aroma, and quality in every bite.`;
};

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

  const allowedSortFields = new Set(["createdAt", "price", "title"]);
  const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";
  const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

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
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const meals = await prisma.meal.findMany({
    where,
    skip,
    take: limit,
    include: {
      category: true,
      reviews: true,
      provider: {
        select: {
          id: true,
          restaurantName: true,
        },
      },
    },
    orderBy: {
      [safeSortBy]: safeSortOrder,
    },
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
      sortBy: safeSortBy,
      sortOrder: safeSortOrder,
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

const updateMeal = async (userId: string, data: any) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  const meal = await prisma.meal.findFirst({
    where: {
      id: data.id,
      providerId: provider.id,
    },
  });

  if (!meal) {
    throw new Error("Meal not found or access denied");
  }

  return await prisma.meal.update({
    where: { id: data.id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.price && { price: data.price }),
      ...(data.image && { image: data.image }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.isAvailable !== undefined && {
        isAvailable: data.isAvailable,
      }),
    },
  });
};

const deleteMeal = async (userId: string, mealId: string) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  const meal = await prisma.meal.findFirst({
    where: {
      id: mealId,
      providerId: provider.id,
    },
  });

  if (!meal) {
    throw new Error("Meal not found or access denied");
  }

  await prisma.meal.update({
    where: { id: mealId },
    data: {
      isAvailable: false,
    },
  });
};

const generateMealDescription = async (input: GenerateDescriptionInput) => {
  if (!input.title?.trim()) {
    throw new Error("Meal title is required");
  }

  if (!OPENROUTER_API_KEY) {
    return {
      description: fallbackDescription(input),
      source: "fallback",
    };
  }

  const systemPrompt =
    "You are a menu copywriter for a food delivery app. Write concise, appetizing meal descriptions in clear English for Bangladeshi customers.";

  const userPrompt = [
    `Meal title: ${input.title}`,
    input.keyPoints ? `Key points: ${input.keyPoints}` : "",
    input.categoryName ? `Category: ${input.categoryName}` : "",
    input.dietaryType ? `Dietary type: ${input.dietaryType}` : "",
    "Write one polished paragraph (35-60 words), no markdown, no bullets.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "FoodHub Meal Description Generator",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 140,
      }),
    });

    if (!response.ok) {
      return {
        description: fallbackDescription(input),
        source: "fallback",
      };
    }

    const data = await response.json();
    const generated = data?.choices?.[0]?.message?.content?.trim();

    if (!generated) {
      return {
        description: fallbackDescription(input),
        source: "fallback",
      };
    }

    return {
      description: generated,
      source: "openrouter",
    };
  } catch {
    return {
      description: fallbackDescription(input),
      source: "fallback",
    };
  }
};

export const mealService = {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  generateMealDescription,
};
