// src/routes/auth.ts
import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key";

// validation schemas
const registerSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  venmoHandle: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  phone: z.string().nullable(),
  venmoHandle: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const watchlistUpdateSchema = z.object({
  listingId: z.string(),
  action: z.enum(["add", "remove"]),
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log("existingUser", existingUser);
      return res.status(400).json({ error: "email already registered" });
    }

    // check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      console.log("existingUsername", existingUsername);
      return res.status(400).json({ error: "username already taken" });
    }

    // verify .edu email (basic version)
    if (!data.email.endsWith(".edu")) {
      console.log("data.email", data.email);
      return res.status(400).json({ error: "must use .edu email" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        emailVerified: false, // we'll handle verification later
      },
    });

    // generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/user/:id
router.get("/user/:id", async (req, res, next) => {
  console.log("req.params.id", req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        listings: true,
        buyerDeals: true,
        sellerDeals: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/auth/user/:id/watchlist
router.patch("/user/:id/watchlist", async (req, res, next) => {
  try {
    const { listingId, action } = watchlistUpdateSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { watchlist: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    let newWatchlist: Prisma.InputJsonValue[] = [
      ...((user.watchlist || []) as Prisma.InputJsonValue[]),
    ];

    if (action === "add") {
      // Add if not already in watchlist
      if (!newWatchlist.includes(listingId)) {
        newWatchlist.push(listingId);
      }
    } else {
      // Remove if exists
      newWatchlist = newWatchlist.filter((id) => id !== listingId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { watchlist: newWatchlist },
      include: {
        listings: true,
        buyerDeals: true,
        sellerDeals: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export const authRoutes = router;
