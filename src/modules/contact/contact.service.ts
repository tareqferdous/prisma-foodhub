import { prisma } from "../../lib/prisma";

type CreateContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const createContactMessage = async (payload: CreateContactMessageInput) => {
  return prisma.contactMessage.create({
    data: payload,
  });
};

const getAllContactMessages = async () => {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const ContactMessageService = {
  createContactMessage,
  getAllContactMessages,
};
