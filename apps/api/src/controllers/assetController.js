import AssetService from '../services/inventory/AssetService.js';

export const createAsset = async (req, res, next) => {
  try {
    const asset = await AssetService.createAsset(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await AssetService.updateAsset(req.params.id, req.body);
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    await AssetService.deleteAsset(req.params.id);
    res.status(200).json({ success: true, message: 'Asset retired successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAssets = async (req, res, next) => {
  try {
    const assets = await AssetService.getAllAssets(req.query);
    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
};

export const logMaintenance = async (req, res, next) => {
  try {
    const { description, cost } = req.body;
    const result = await AssetService.logMaintenance(req.params.id, req.user.id, description, cost);
    res.status(201).json({ success: true, data: result[1] });
  } catch (error) {
    next(error);
  }
};

export const resolveMaintenance = async (req, res, next) => {
  try {
    const result = await AssetService.resolveMaintenance(req.params.logId);
    res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    next(error);
  }
};
