import { DietRepository } from '../repositories/DietRepository.js';

export class DietService {
  static async getMemberDietPlans(memberId) {
    return await DietRepository.findByMemberId(memberId);
  }

  static async getTrainerDietPlans(trainerId) {
    return await DietRepository.findByTrainerId(trainerId);
  }

  static async createDietPlan(dietData, meals = []) {
    return await DietRepository.create(dietData, meals);
  }
}
