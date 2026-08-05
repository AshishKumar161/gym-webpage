/**
 * Member Dashboard Router — Dynamically loads member sub-modules.
 */
import { safeFetchApi, getCurrentUser } from '../../utils/auth.js';

export async function renderMemberView(tab) {
  try {
    switch (tab) {
      case 'overview':
      default: {
        const { renderMemberOverview } = await import('./member/MemberOverview.js');
        return await renderMemberOverview();
      }
      case 'profile': {
        const { renderMemberProfile } = await import('./member/MemberProfile.js');
        return await renderMemberProfile();
      }
      case 'membership': {
        const { renderMemberPlans } = await import('./member/MemberPlans.js');
        return await renderMemberPlans();
      }
      case 'payments': {
        const { renderMemberPayments } = await import('./member/MemberPayments.js');
        return await renderMemberPayments();
      }
      case 'messages': {
        const { renderMemberMessages } = await import('./member/MemberMessages.js');
        return await renderMemberMessages();
      }
      case 'workouts': {
        const { renderMemberWorkout } = await import('./member/MemberWorkout.js');
        return await renderMemberWorkout();
      }
      case 'diets': {
        const { renderMemberDiet } = await import('./member/MemberDiet.js');
        return await renderMemberDiet();
      }
      case 'qr-checkin':
      case 'attendance': {
        const { renderMemberAttendance } = await import('./member/MemberAttendance.js');
        // Passing tab to know if we are on 'qr-checkin' or 'attendance'
        return await renderMemberAttendance(tab);
      }
      case 'progress':
      case 'calculator': {
        const { renderMemberProgress } = await import('./member/MemberProgress.js');
        return await renderMemberProgress();
      }
      case 'goals': {
        const { renderMemberGoals } = await import('./member/MemberGoals.js');
        return await renderMemberGoals();
      }
      case 'store': {
        const { renderMemberStore } = await import('./member/MemberStore.js');
        return await renderMemberStore();
      }
      case 'notifications': {
        const { renderMemberNotifications } = await import('./member/MemberNotifications.js');
        return await renderMemberNotifications();
      }
      case 'settings': {
        const { renderMemberSettings } = await import('./member/MemberSettings.js');
        return await renderMemberSettings();
      }
    }
  } catch (err) {
    console.error("Member view rendering error:", err);
    throw err;
  }
}
