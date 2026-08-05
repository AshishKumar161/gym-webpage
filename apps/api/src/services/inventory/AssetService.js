import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class AssetService {
  static async createAsset(data) {
    return prisma.asset.create({
      data
    });
  }

  static async updateAsset(id, data) {
    return prisma.asset.update({
      where: { id },
      data
    });
  }

  static async deleteAsset(id) {
    // Maybe just mark as RETIRED instead of hard delete
    return prisma.asset.update({
      where: { id },
      data: { status: 'RETIRED' }
    });
  }

  static async getAllAssets(filters = {}) {
    return prisma.asset.findMany({
      where: filters,
      include: {
        maintenanceLogs: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async logMaintenance(assetId, reportedBy, description, cost = 0) {
    return prisma.$transaction([
      prisma.asset.update({
        where: { id: assetId },
        data: { status: 'MAINTENANCE' }
      }),
      prisma.maintenanceLog.create({
        data: {
          assetId,
          reportedBy,
          description,
          cost,
          status: 'IN_PROGRESS'
        }
      })
    ]);
  }

  static async resolveMaintenance(logId) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
    if (!log) throw new Error('Maintenance log not found');

    return prisma.$transaction([
      prisma.maintenanceLog.update({
        where: { id: logId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date()
        }
      }),
      prisma.asset.update({
        where: { id: log.assetId },
        data: { status: 'ACTIVE' }
      })
    ]);
  }
}
