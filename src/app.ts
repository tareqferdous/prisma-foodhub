import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import errorHandler from "./middlewares/globalErrorHandler";
import { CategoryRoutes } from "./modules/category/category.route";
import { mealRouter } from "./modules/meal/meal.router";
import { orderRouter } from "./modules/order/order.route";
import { ProviderRoutes } from "./modules/provider/provider.route";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000", // client side url
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/categories", CategoryRoutes);

app.use("/api/providers", ProviderRoutes);

app.use("/api/meals", mealRouter);

app.use("/api/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(errorHandler);

export default app;
