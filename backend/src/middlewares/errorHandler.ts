import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[] = [];

  // Operational errors (known AppErrors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Mongoose validation error
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  else if ((err as NodeJS.ErrnoException).code === '11000') {
    statusCode = 409;
    const field = Object.keys((err as Record<string, unknown>).keyValue || {}).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose cast error (invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log non-operational errors
  if (statusCode === 500) {
    logger.error('Unhandled error:', {
      method: req.method,
      url: req.url,
      error: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const err = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(err);
};
