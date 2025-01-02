// src/routes/listings.ts
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Response {
    error: (code: number, message: string) => Response;
    success: (code: number, message: string, result: any) => Response;
  }
}

const prisma = new PrismaClient();
const router = Router();

// validation schemas
const createListingSchema = z.object({
  isbn: z.string(),
  title: z.string(),
  author: z.string(),
  edition: z.string(),
  courseCodes: z.array(z.string()),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  hasNotes: z.boolean().default(false),
  hasHighlights: z.boolean().default(false),
  price: z.number(),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  sellerId: z.string(),
});

// GET /api/listings
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, condition, course, maxPrice } = req.query;

    const listings = await prisma.listing.findMany({
      where: {
        status: "AVAILABLE",
        ...(condition && { condition: condition as any }),
        ...(course && { courseCodes: { has: course as string } }),
        ...(maxPrice && { price: { lte: parseFloat(maxPrice as string) } }),
        ...(q && {
          OR: [
            { title: { contains: q as string, mode: "insensitive" } },
            { author: { contains: q as string, mode: "insensitive" } },
            { description: { contains: q as string, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(listings);
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ error: "listing not found" });
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
});

// POST /api/listings
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createListingSchema.parse(req.body);

    // Add this check
    const seller = await prisma.user.findUnique({
      where: { id: data.sellerId },
    });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const listing = await prisma.listing.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
      },
    });

    console.log("listing", listing);
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/listings/:id
router.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listing = await prisma.listing.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(listing);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/listings/:id
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.listing.update({
        where: { id: req.params.id },
        data: { status: "DELETED" },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export const listingRoutes = router;
