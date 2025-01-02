import { ErrorRequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "validation error",
      details: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      error: "database error",
      code: err.code,
    });
  }

  res.status(500).json({ error: "internal server error" });
};
