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
    await this.getMembershipById(id);
    return await MembershipRepository.update(id, data);
  }

  static async deleteMembership(id) {
    await this.getMembershipById(id);
    return await MembershipRepository.delete(id);
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
      status: 'active',
      paymentReference: paymentRef
    });
  }
}
