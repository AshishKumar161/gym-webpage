/**
 * Admin Dashboard Router — Dynamically loads admin sub-modules.
 */
import { safeFetchApi } from '../../utils/auth.js';

export async function renderAdminView(tab) {
  try {
    switch (tab) {
      case 'overview':
      default: {
        const { renderAdminOverview } = await import('./admin/AdminOverview.js');
        return await renderAdminOverview();
      }
      case 'members': {
        const { renderAdminMembers } = await import('./admin/AdminMembers.js');
        return await renderAdminMembers();
      }
      case 'trainers': {
        const { renderAdminTrainers } = await import('./admin/AdminTrainers.js');
        return await renderAdminTrainers();
      }
      case 'plans': {
        const { renderAdminPlans } = await import('./admin/AdminPlans.js');
        return await renderAdminPlans();
      }
      case 'attendance': {
        const { renderAdminAttendance } = await import('./admin/AdminAttendance.js');
        return await renderAdminAttendance();
      }
      case 'payments': {
        const { renderAdminPayments } = await import('./admin/AdminPayments.js');
        return await renderAdminPayments();
      }
      case 'notifications': {
        const { renderAdminNotifications } = await import('./admin/AdminNotifications.js');
        return await renderAdminNotifications();
      }
      case 'analytics': {
        const { renderAdminAnalytics } = await import('./admin/AdminAnalytics.js');
        return await renderAdminAnalytics();
      }
      case 'inventory': {
        const { renderAdminInventory } = await import('./admin/AdminInventory.js');
        return await renderAdminInventory();
      }
      case 'pos': {
        const { renderAdminPOS } = await import('./admin/AdminPOS.js');
        return await renderAdminPOS();
      }
      case 'assets': {
        const { renderAdminAssets } = await import('./admin/AdminAssets.js');
        return await renderAdminAssets();
      }
      case 'suppliers': {
        const { renderAdminSuppliers } = await import('./admin/AdminSuppliers.js');
        return await renderAdminSuppliers();
      }
      case 'settings': {
        const { renderAdminSettings } = await import('./admin/AdminSettings.js');
        return await renderAdminSettings();
      }
    }
  } catch (err) {
    console.error("Admin view rendering error:", err);
    throw err;
  }
}
