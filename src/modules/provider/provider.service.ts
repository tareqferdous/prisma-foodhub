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

export const ProviderService = {
  createProviderProfile,
};
