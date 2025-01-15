import { NextFunction, Request, Response } from 'express';

import config from '../../config';
import { JwtPayload, Secret } from 'jsonwebtoken';
import httpStatus from 'http-status';
import prisma from '../../shared/prisma';


import ApiError from '../../errors/ApiErrors';
import { jwtHelpers } from '../../helpars/jwtHelpers';

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      if (!verifiedUser?.email) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }
      const { id } = verifiedUser;

      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
      }

      req.user = verifiedUser as JwtPayload;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Forbidden! You are not authorized!'
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const checkOTP = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );

    if (!verifiedUser?.email) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }
    const { id } = verifiedUser;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
    }
    req.user = verifiedUser as JwtPayload;
    next();
  } catch (err) {
    next(err);
  }
};

export default auth;