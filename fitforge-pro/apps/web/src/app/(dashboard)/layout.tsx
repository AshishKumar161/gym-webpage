"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  LayoutDashboard,
  CreditCard,
  Calendar,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Users,
  Images,
  BookOpen,
  Tag,
  History,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Links based on Roles
const memberLinks = [
  { label: "Overview", href: "/dashboard/member", icon: LayoutDashboard },
  { label: "Membership", href: "/dashboard/member/membership", icon: CreditCard },
  { label: "Workouts", href: "/dashboard/member/workouts", icon: Dumbbell },
  { label: "Classes", href: "/dashboard/member/classes", icon: Calendar },
  { label: "Bookings", href: "/dashboard/member/bookings", icon: Calendar },
  { label: "Rewards", href: "/dashboard/member/rewards", icon: Award },
  { label: "Settings", href: "/dashboard/member/settings", icon: Settings },
];

const adminLinks = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Memberships", href: "/dashboard/admin/memberships", icon: CreditCard },
  { label: "Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
  { label: "Gallery CMS", href: "/dashboard/admin/gallery", icon: Images },
  { label: "Blog CMS", href: "/dashboard/admin/blog", icon: BookOpen },
  { label: "Coupons", href: "/dashboard/admin/coupons", icon: Tag },
  { label: "Audit Logs", href: "/dashboard/admin/logs", icon: History },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

const ownerLinks = [
  { label: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
  { label: "Financials", href: "/dashboard/owner/financials", icon: TrendingUp },
  { label: "Reports", href: "/dashboard/owner/reports", icon: BookOpen },
  { label: "Settings", href: "/dashboard/owner/settings", icon: Settings },
];

const trainerLinks = [
  { label: "Overview", href: "/dashboard/trainer", icon: LayoutDashboard },
  { label: "My Clients", href: "/dashboard/trainer/clients", icon: Users },
  { label: "Schedule", href: "/dashboard/trainer/schedule", icon: Calendar },
  { label: "Settings", href: "/dashboard/trainer/settings", icon: Settings },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl border border-brand-gold/20 flex items-center justify-center animate-pulse">
            <Dumbbell className="w-8 h-8 text-brand-gold" />
          </div>
          <div className="absolute inset-0 border-2 border-brand-gold border-t-transparent rounded-xl animate-spin" />
        </div>
        <p className="text-sm text-white/50 tracking-wider animate-pulse">
          FORGING YOUR DASHBOARD...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  // Determine which links to show
  const links =
    user.role === "OWNER"
      ? ownerLinks
      : user.role === "ADMIN"
        ? adminLinks
        : user.role === "TRAINER"
          ? trainerLinks
          : memberLinks;


  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-dark text-white flex">
      {/* ─── SIDEBAR (Desktop) ──────────────────────────────────────────────── */}
      <aside className="w-64 bg-dark-50 border-r border-white/5 hidden md:flex flex-col flex-shrink-0 z-20">
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center shadow-gold">
              <Dumbbell className="w-4.5 h-4.5 text-dark" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-heading font-black text-base gold-text block leading-none">
                FitForge Pro
              </span>
              <span className="text-[8px] tracking-[0.3em] text-white/30 uppercase">
                {user.role} Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 transition-colors duration-200",
                    isActive ? "text-brand-gold" : "text-white/40 group-hover:text-white/70"
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/2 border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center text-dark font-black text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xxs text-white/40 truncate uppercase font-bold tracking-wider">
                {user.role}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-dark/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          {/* Menu button (mobile) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-white/80"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title placeholder or breadcrumbs */}
          <div className="text-sm font-semibold text-white/50 hidden md:block">
            Dashboard / {links.find((l) => pathname === l.href)?.label ?? "Portal"}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button
              className="relative w-9 h-9 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            </button>

            {/* Profile trigger */}
            <Link
              href={
                user.role === "OWNER"
                  ? "/dashboard/owner/settings"
                  : user.role === "ADMIN"
                    ? "/dashboard/admin/settings"
                    : "/dashboard/member/settings"
              }
              className="flex items-center gap-2 border border-white/5 bg-white/2 hover:bg-white/5 py-1.5 px-3 rounded-lg transition-colors group"
            >
              <div className="w-6 h-6 rounded bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-xs">
                {initials.slice(0, 1)}
              </div>
              <span className="text-xs text-white/70 group-hover:text-white transition-colors hidden sm:inline">
                {user.firstName}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" role="main">
          {children}
        </main>
      </div>

      {/* ─── MOBILE DRAWER MENU ────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-dark/80 backdrop-blur-md z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-72 bg-dark-50 border-r border-white/5 z-50 md:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center shadow-gold">
                    <Dumbbell className="w-4 h-4 text-dark" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-heading font-black text-sm gold-text block leading-none">
                      FitForge Pro
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="pt-4 border-t border-white/5 mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center text-dark font-black text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-xxs text-white/40 uppercase tracking-widest font-bold">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
