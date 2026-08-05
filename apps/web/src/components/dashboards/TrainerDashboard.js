/**
 * Trainer Dashboard Router — Dynamically loads trainer sub-modules.
 */
import { safeFetchApi } from '../../utils/auth.js';

export async function renderTrainerView(tab) {
  try {
    switch (tab) {
      case 'overview':
      default: {
        const { renderTrainerOverview } = await import('./trainer/TrainerOverview.js');
        return await renderTrainerOverview();
      }
      case 'assigned-members': {
        const { renderTrainerMembers } = await import('./trainer/TrainerMembers.js');
        return await renderTrainerMembers();
      }
      case 'workouts': {
        const { renderTrainerWorkouts } = await import('./trainer/TrainerWorkouts.js');
        return await renderTrainerWorkouts();
      }
      case 'diets': {
        const { renderTrainerDiets } = await import('./trainer/TrainerDiets.js');
        return await renderTrainerDiets();
      }
      case 'progress': {
        const { renderTrainerProgress } = await import('./trainer/TrainerProgress.js');
        return await renderTrainerProgress();
      }
      case 'classes':
      case 'schedule': {
        const { renderTrainerSchedule } = await import('./trainer/TrainerSchedule.js');
        return await renderTrainerSchedule();
      }
      case 'attendance': {
        const { renderTrainerAttendance } = await import('./trainer/TrainerAttendance.js');
        return await renderTrainerAttendance();
      }
      case 'chat': {
        const { renderTrainerMessaging } = await import('./trainer/TrainerMessaging.js');
        return await renderTrainerMessaging();
      }
      case 'notifications': {
        const { renderTrainerNotifications } = await import('./trainer/TrainerNotifications.js');
        return await renderTrainerNotifications();
      }
      case 'profile':
      case 'settings': {
        const { renderTrainerProfile } = await import('./trainer/TrainerProfile.js');
        return await renderTrainerProfile();
      }
    }
  } catch (err) {
    console.error("Trainer view rendering error:", err);
    throw err;
  }
}
