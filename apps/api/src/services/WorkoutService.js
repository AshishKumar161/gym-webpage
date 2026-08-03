import { WorkoutRepository } from '../repositories/WorkoutRepository.js';

export class WorkoutService {
  static async getMemberWorkoutPlans(memberId) {
    return await WorkoutRepository.findByMemberId(memberId);
  }

  static async getTrainerWorkoutPlans(trainerId) {
    return await WorkoutRepository.findByTrainerId(trainerId);
  }

  static async createWorkoutPlan(workoutData, exercises = []) {
    return await WorkoutRepository.create(workoutData, exercises);
  }
}
