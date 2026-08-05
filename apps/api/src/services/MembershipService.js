import { MembershipRepository } from '../repositories/MembershipRepository.js';
import { NotFoundError } from '../errors/AppError.js';

export class MembershipService {
  static async getAllMemberships() {
    return await MembershipRepository.findAll();
  }

  static async getMembershipById(id) {
    const plan = await MembershipRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Membership plan not found.');
    }
    return plan;
  }

  static async createMembership(data) {
    return await MembershipRepository.create(data);
  }

  static async updateMembership(id, data) {
    try {
      return await MembershipRepository.update(id, data);
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundError('Membership plan not found.');
      throw error;
    }
  }

  static async deleteMembership(id) {
    try {
      return await MembershipRepository.delete(id);
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundError('Membership plan not found.');
      throw error;
    }
  }

  static async subscribeUser(userId, membershipId, paymentRef = '') {
    const membership = await this.getMembershipById(membershipId);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + membership.durationMonths * 30 * 24 * 60 * 60 * 1000);

    return await MembershipRepository.createSubscription({
      userId,
      membershipId,
      startDate,
      endDate,
      status: 'ACTIVE',
      paymentReference: paymentRef
    });
  }
}
