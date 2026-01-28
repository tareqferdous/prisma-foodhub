import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import { mealRouter } from "./modules/meal/meal.router";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000", // client side url
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/meals", mealRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
