import { prisma } from "../../lib/prisma";

const updateUserProfile = async (
  userId: string,
  name: string,
  image: string,
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      image,
    },
  });
  return updatedUser;
};

export const profileService = {
  updateUserProfile,
};
