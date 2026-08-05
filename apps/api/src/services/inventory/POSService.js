import { PrismaClient } from '@prisma/client';
import ProductService from './ProductService.js';
import { generateUniqueId } from '../../utils/helpers.js';

const prisma = new PrismaClient();

export default class POSService {
  static async checkout(cartItems, paymentMethod, notes, cashierId, userId = null) {
    let subtotal = 0;
    let totalTax = 0;
    const saleItemsData = [];

    // Begin transaction? Actually we need to check stock.
    // To handle concurrency properly, we can use an interactive transaction
    return await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true }
        });

        if (!product) throw new Error(`Product not found: ${item.productId}`);
        
        if (product.inventory && product.inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const price = parseFloat(product.price);
        const itemSubtotal = price * item.quantity;
        const itemTax = itemSubtotal * (parseFloat(product.taxRate) / 100);
        
        subtotal += itemSubtotal;
        totalTax += itemTax;

        saleItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price,
          tax: itemTax,
          total: itemSubtotal + itemTax
        });

        // Deduct inventory
        if (product.inventory) {
          const newQty = product.inventory.quantity - item.quantity;
          await tx.inventory.update({
            where: { id: product.inventory.id },
            data: { quantity: newQty }
          });

          await tx.inventoryTransaction.create({
            data: {
              inventoryId: product.inventory.id,
              type: 'OUT',
              quantity: item.quantity,
              reason: 'POS Sale',
              userId: cashierId
            }
          });
        }
      }

      const total = subtotal + totalTax;
      const receiptNumber = `REC-${Date.now()}-${generateUniqueId(4)}`;

      // Create Sale
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          userId,
          cashierId,
          subtotal,
          tax: totalTax,
          total,
          paymentMethod,
          status: 'COMPLETED',
          notes,
          items: {
            create: saleItemsData
          }
        },
        include: {
          items: {
            include: { product: true }
          },
          user: true,
          cashier: true
        }
      });

      return sale;
    });
  }

  static async getSalesHistory(filters = {}) {
    return prisma.sale.findMany({
      where: filters,
      include: {
        items: { include: { product: true } },
        user: true,
        cashier: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
