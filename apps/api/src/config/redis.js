/**
 * Redis Cache Module — Handles query caching for high concurrency scaling.
 */
import logger from '../utils/logger.js';

const cacheStore = new Map();

export const cacheGet = async (key) => {
  try {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      cacheStore.delete(key);
      return null;
    }
    return JSON.parse(item.value);
  } catch (err) {
    logger.error(`Cache get error: ${err.message}`);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    const expiry = Date.now() + ttlSeconds * 1000;
    cacheStore.set(key, { value: JSON.stringify(value), expiry });
  } catch (err) {
    logger.error(`Cache set error: ${err.message}`);
  }
};

export const cacheDel = async (key) => {
  cacheStore.delete(key);
};
