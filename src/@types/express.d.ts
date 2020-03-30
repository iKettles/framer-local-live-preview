import * as express from 'express';
import { NextFunction } from 'connect';

declare module 'express' {
  interface Response {
    success: NextFunction;
    error: NextFunction;
  }
}
