import { Request, Response, NextFunction } from 'express';
import { NotFoundError, HTTPError } from '../utils/errors';

export default (req: Request, res: Response, next: NextFunction) => {
  res.error = (err: Error | NotFoundError) => {
    const body: any = {
      errorCode: 'UNKNOWN'
    };

    res.status(500);

    if (err instanceof HTTPError) {
      res.status((err as HTTPError).statusCode);
      body.errorCode = err.code;
      body.errorMessage = err.message;
      body.statusCode = err.statusCode;
    } else {
      body.errorMessage = err.message;
    }

    console.error(`${res.statusCode} [${req.path}]`, err);

    res.json(body);
  };

  next();
};
