import { NextFunction, Request, Response } from "express";
import { ContactMessageService } from "./contact.service";

const createContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim();
    const subject = String(req.body?.subject ?? "").trim();
    const message = String(req.body?.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject and message are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message should be at least 10 characters",
      });
    }

    const savedMessage = await ContactMessageService.createContactMessage({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: savedMessage,
    });
  } catch (error) {
    next(error);
  }
};

const getAllContactMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const messages = await ContactMessageService.getAllContactMessages();

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const ContactMessageController = {
  createContactMessage,
  getAllContactMessages,
};
