import { prisma } from "../../lib/prisma";

const createCategory = async (name: string) => {
  const existing = await prisma.category.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error("Category already exists");
  }

  return prisma.category.create({
    data: { name },
  });
};

const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
};
