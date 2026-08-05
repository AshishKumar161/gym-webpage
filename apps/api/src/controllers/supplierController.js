import SupplierService from '../services/inventory/SupplierService.js';

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await SupplierService.createSupplier(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await SupplierService.getAllSuppliers();
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

export const createPO = async (req, res, next) => {
  try {
    const po = await SupplierService.createPurchaseOrder(req.body);
    res.status(201).json({ success: true, data: po });
  } catch (error) {
    next(error);
  }
};

export const updatePOStatus = async (req, res, next) => {
  try {
    const po = await SupplierService.updatePurchaseOrderStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    next(error);
  }
};

export const getPOs = async (req, res, next) => {
  try {
    const pos = await SupplierService.getPurchaseOrders(req.query.supplierId);
    res.status(200).json({ success: true, data: pos });
  } catch (error) {
    next(error);
  }
};
