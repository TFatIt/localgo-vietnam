import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler so errors are forwarded to Express error middleware.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Standard success response format.
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard paginated response format.
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
): void => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};
