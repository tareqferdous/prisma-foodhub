import { prisma } from "../../lib/prisma";

interface CreateProviderInput {
  restaurantName: string;
  description?: string;
  address?: string;
  phone?: string;
  userId: string;
}

export const createProviderProfile = async (data: CreateProviderInput) => {
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

export const ProviderService = {
  createProviderProfile,
  getProvider,
  getAllProviders,
};
