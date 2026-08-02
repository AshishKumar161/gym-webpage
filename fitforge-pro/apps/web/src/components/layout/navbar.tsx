"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Dumbbell, ChevronDown, User, LogOut, LayoutDashboard, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "#services",
    children: [
      { label: "Personal Training", href: "#personal-training" },
      { label: "Group Classes", href: "#classes" },
      { label: "Diet Planning", href: "#diet" },
      { label: "Online Coaching", href: "#online" },
    ],
  },
  { label: "Programs", href: "#programs" },
  { label: "Trainers", href: "#trainers" },
  { label: "Membership", href: "#membership" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "py-3 bg-dark/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "py-5 bg-transparent"
        )}
        role="banner"
      >
        <div className="page-container flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="FitForge Pro Home"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-shadow duration-300">
              <Dumbbell className="w-5 h-5 text-dark" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-gold to-brand-fire opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-lg leading-none gold-text">
                FitForge
              </span>
              <span className="text-[10px] font-semibold tracking-[0.3em] text-white/40 uppercase leading-none">
                Pro
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Main navigation"
            ref={dropdownRef}
          >
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === link.label ? null : link.label
                      )
                    }
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                      activeDropdown === link.label
                        ? "text-brand-gold"
                        : "text-white/70 hover:text-white"
                    )}
                    aria-expanded={activeDropdown === link.label}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        activeDropdown === link.label && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-52 glass-card p-2"
                        role="menu"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            role="menuitem"
                            className="flex items-center px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-150"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    pathname === link.href
                      ? "text-brand-gold"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="btn-primary !px-6 !py-2.5 !text-sm"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all duration-200"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-expanded={isMobileOpen}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait">
              {isMobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-dark/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-dark-100 border-l border-white/5 lg:hidden overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-dark" strokeWidth={2.5} />
                  </div>
                  <span className="font-heading font-black gold-text text-lg">FitForge Pro</span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-6 space-y-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors duration-150"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors duration-150"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-6 border-t border-white/5 space-y-3">
                <Link
                  href="/auth/login"
                  className="btn-ghost w-full text-center"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary w-full text-center"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Join Now — Free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
