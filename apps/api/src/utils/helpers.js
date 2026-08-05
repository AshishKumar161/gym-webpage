import crypto from 'crypto';

export function generateUniqueId(length = 6) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}
