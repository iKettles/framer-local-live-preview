import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  res.success = (data: any) => {
    const body: any = {
      result: data
    };

    res.status(200);
    res.json(body);
  };

  next();
};
