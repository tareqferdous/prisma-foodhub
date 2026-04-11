import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import errorHandler from "./middlewares/globalErrorHandler";
import { AdminRoutes } from "./modules/admin/admin.route";
import { CategoryRoutes } from "./modules/category/category.route";
import { chatRouter } from "./modules/chat/chat.route";
import { ContactMessageRoutes } from "./modules/contact/contact.route";
import { mealRouter } from "./modules/meal/meal.router";
import { orderRouter } from "./modules/order/order.route";
import { ProfileRoutes } from "./modules/profile/profile.route";
import { ProviderRoutes } from "./modules/provider/provider.route";
import { reviewRoutes } from "./modules/review/review.route";

const app: Application = express();

app.use(express.json());

const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Vercel preview

      if (isAllowed) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/categories", CategoryRoutes);

app.use("/api/contact-messages", ContactMessageRoutes);

app.use("/api/providers", ProviderRoutes);

app.use("/api/meals", mealRouter);

app.use("/api/orders", orderRouter);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", AdminRoutes);

app.use("/api/profile", ProfileRoutes);

app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(errorHandler);

app.set("trust proxy", 1);

export default app;
