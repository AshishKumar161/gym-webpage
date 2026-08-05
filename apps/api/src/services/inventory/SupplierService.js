import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class SupplierService {
  static async createSupplier(data) {
    return prisma.supplier.create({ data });
  }

  static async updateSupplier(id, data) {
    return prisma.supplier.update({
      where: { id },
      data
    });
  }

  static async getAllSuppliers() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async createPurchaseOrder(data) {
    return prisma.purchaseOrder.create({
      data
    });
  }

  static async updatePurchaseOrderStatus(id, status) {
    return prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });
  }

  static async getPurchaseOrders(supplierId = null) {
    const where = supplierId ? { supplierId } : {};
    return prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
