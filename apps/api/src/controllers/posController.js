import POSService from '../services/inventory/POSService.js';

export const checkout = async (req, res, next) => {
  try {
    const { cartItems, paymentMethod, notes, userId } = req.body;
    const sale = await POSService.checkout(cartItems, paymentMethod, notes, req.user.id, userId);
    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
};

export const getSales = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.userId) filters.userId = req.query.userId;
    
    const sales = await POSService.getSalesHistory(filters);
    res.status(200).json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};
