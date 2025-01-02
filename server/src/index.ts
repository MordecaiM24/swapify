// src/index.ts
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { errorHandler } from "./middleware/error";
import { listingRoutes } from "./routes/listings";
import { authRoutes } from "./routes/auth";
import { chatRoutes } from "./routes/chat";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get("/health", (req, res) => res.json({ status: "+" }));

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`server running on port ${port}`);
    });
  } catch (error) {
    console.error("failed to start server:", error);
    process.exit(1);
  }
};

start();
