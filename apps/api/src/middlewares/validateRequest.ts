import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = (error as any).errors.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({
          status: 'fail',
          message: 'Invalid request data',
          errors: errorMessages,
        });
      } else {
        next(error);
      }
    }
  };
};
