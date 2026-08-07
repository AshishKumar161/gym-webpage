import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message = 'Success', statusCode = 200, meta?: any) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
    meta,
  });
};

export const sendCreated = (res: Response, data: any, message = 'Created') => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (res: Response, message: string, statusCode = 400, errors?: any) => {
  return res.status(statusCode).json({
    status: 'fail',
    message,
    errors,
  });
};
