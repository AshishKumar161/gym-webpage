import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server.js';
import { RoleType } from '@prisma/client';

/**
 * Check specific permission from DB.
 * Example: hasPermission('create', 'member')
 */
export const hasPermission = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ status: 'fail', message: 'Authentication required' });
      return;
    }

    // Super admin bypasses all permission checks
    if (user.roles?.includes(RoleType.SUPER_ADMIN)) {
      next();
      return;
    }

    try {
      // Check if any of the user's roles have the permission
      let hasPerm = false;
      
      for (const roleName of user.roles || []) {
        const permission = await prisma.rolePermission.findFirst({
          where: {
            role: roleName as RoleType,
            permission: {
              action,
              resource,
            },
          },
        });

        if (permission) {
          hasPerm = true;
          break;
        }
      }

      if (!hasPerm) {
        res.status(403).json({ status: 'fail', message: `You do not have permission to ${action} ${resource}` });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
