import ProductService from '../services/inventory/ProductService.js';

export const createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { includeArchived } = req.query;
    const products = await ProductService.getAllProducts(includeArchived === 'true');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { quantityChange, reason } = req.body;
    const result = await ProductService.adjustStock(req.params.id, parseInt(quantityChange), reason, req.user.id);
    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
};
