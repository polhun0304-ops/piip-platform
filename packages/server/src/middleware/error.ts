import { NextFunction, Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ code: "NOT_FOUND", message: "Route not found" });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ code: "INTERNAL_ERROR", message });
}
