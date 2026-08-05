import { PrismaClient } from '@prisma/client';
import { generateUniqueId } from '../../utils/helpers.js';

const prisma = new PrismaClient();

export default class ProductService {
  static async createProduct(data) {
    const sku = data.sku || `SKU-${Date.now()}-${generateUniqueId(3)}`;
    const barcode = data.barcode || sku; // Optional: could integrate a barcode gen lib

    return prisma.product.create({
      data: {
        ...data,
        sku,
        barcode,
        inventory: {
          create: {
            quantity: data.initialStock || 0,
            lowStockThreshold: data.lowStockThreshold || 5,
          }
        }
      },
      include: {
        inventory: true,
        category: true,
        brand: true
      }
    });
  }

  static async updateProduct(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        inventory: true,
        category: true,
        brand: true
      }
    });
  }

  static async deleteProduct(id) {
    // Soft delete/archive logic
    return prisma.product.update({
      where: { id },
      data: { isArchived: true }
    });
  }

  static async getAllProducts(includeArchived = false) {
    return prisma.product.findMany({
      where: includeArchived ? {} : { isArchived: false },
      include: {
        inventory: true,
        category: true,
        brand: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async adjustStock(productId, quantityChange, reason, userId) {
    const inventory = await prisma.inventory.findUnique({ where: { productId } });
    if (!inventory) throw new Error('Inventory not found for product');

    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) throw new Error('Insufficient stock');

    const type = quantityChange >= 0 ? 'IN' : 'OUT';

    return prisma.$transaction([
      prisma.inventory.update({
        where: { productId },
        data: { quantity: newQuantity }
      }),
      prisma.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type,
          quantity: Math.abs(quantityChange),
          reason,
          userId
        }
      })
    ]);
  }
}
