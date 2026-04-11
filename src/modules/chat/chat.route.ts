import { Request, Response, Router } from "express";
import { ChatService } from "./chat.service";

const chatRouter = Router();

// POST /api/chat
chatRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Limit message length
    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message is too long (max 500 characters)",
      });
    }

    const result = await ChatService.chat(message);

    return res.status(200).json({
      success: result.success,
      data: {
        message: result.message,
        timestamp: result.timestamp,
        source: result.source || "fallback",
      },
      error: result.error || null,
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { chatRouter };
