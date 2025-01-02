// src/routes/chat.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

const createThreadSchema = z.object({
  listingId: z.string(),
  buyerId: z.string(),
});

const sendMessageSchema = z.object({
  text: z.string().min(1),
});

declare global {
  namespace Express {
    interface Request {
      userId: string; // or whatever type userId is
    }
  }
}

// GET /api/chat/threads/:userId
router.get("/threads/:userId", async (req, res) => {
  const userId = req.params.userId;

  const threads = await prisma.chatThread.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      listing: {
        select: {
          title: true,
          price: true,
          condition: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json(threads);
});

// GET /api/chat/threads/:threadId/messages
router.get("/threads/:threadId/messages/:userId", async (req, res) => {
  const userId = req.params.userId;

  const thread = await prisma.chatThread.findFirst({
    where: {
      id: req.params.threadId,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
  });

  if (!thread) {
    console.log("not found");
    return res.status(404).json({ error: "not found" });
  }

  const messages = await prisma.message.findMany({
    where: { threadId: req.params.threadId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: {
      threadId: req.params.threadId,
      senderId: { not: req.userId },
      read: false,
    },
    data: { read: true },
  });

  res.json(messages);
});

// POST /api/chat/threads
router.post("/threads", async (req, res) => {
  const { listingId } = createThreadSchema.parse(req.body);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) return res.status(404).json({ error: "listing not found" });
  if (listing.sellerId === req.userId)
    return res.status(400).json({ error: "cant message own listing" });

  const thread = await prisma.chatThread.create({
    data: {
      listingId,
      buyerId: req.userId,
      sellerId: listing.sellerId,
    },
  });

  res.status(201).json(thread);
});

// POST /api/chat/threads/:threadId/messages
router.post("/threads/:threadId/messages/:userId", async (req, res) => {
  console.log("received");
  const { text } = sendMessageSchema.parse(req.body);
  const userId = req.params.userId;

  const thread = await prisma.chatThread.findFirst({
    where: {
      id: req.params.threadId,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
  });

  if (!thread) return res.status(404).json({ error: "not found" });

  const [message] = await Promise.all([
    prisma.message.create({
      data: {
        threadId: req.params.threadId,
        senderId: userId,
        text,
      },
    }),
    prisma.chatThread.update({
      where: { id: req.params.threadId },
      data: { updatedAt: new Date() },
    }),
  ]);

  res.status(201).json(message);
});

// POST /api/chat/create/:userId
router.post("/create/:userId", async (req, res) => {
  console.log("received");
  const { listingId } = req.body;
  const buyerId = req.params.userId;
  console.log(listingId, buyerId);

  const listingChat = await prisma.chatThread.findFirst({
    where: {
      listingId,
      buyerId,
    },
  });

  if (listingChat) {
    return res.json(listingChat); // return existing thread
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });
  if (!listing) return res.status(404).json({ error: "listing not found" });

  const newThread = await prisma.chatThread.create({
    data: {
      listingId,
      buyerId,
      sellerId: listing.sellerId,
    },
  });

  res.status(201).json(newThread);
});

// GET /find/:userId/:listingId
router.get("/find/:userId/:listingId", async (req, res) => {
  const { userId, listingId } = req.params;

  const thread = await prisma.chatThread.findFirst({
    where: {
      listingId,
      buyerId: userId,
    },
  });

  if (!thread) {
    return res.status(404).json({ error: "not found" });
  }

  res.json(thread);
});

export const chatRoutes = router;
