import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../utils/errors';

export const handleValidationError = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.error(
      new BadRequestError(
        errors
          .array()
          .map((err: any) => `${err.param} is invalid`)
          .join(',')
      )
    );
  } else {
    next();
  }
};
