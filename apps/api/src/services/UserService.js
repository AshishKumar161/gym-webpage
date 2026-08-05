import { UserRepository } from '../repositories/UserRepository.js';
import { NotFoundError } from '../errors/AppError.js';

export class UserService {
  static async getUserProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }
    return user;
  }

  static async updateUserProfile(userId, updateData) {
    try {
      return await UserRepository.update(userId, updateData);
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundError('User profile not found.');
      throw error;
    }
  }

  static async listUsers({ page = 1, limit = 10, role = null }) {
    const skip = (page - 1) * limit;
    return await UserRepository.list({ skip, take: limit, role });
  }
}
