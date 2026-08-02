"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Dumbbell, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: data.email, password: data.password }),
        }
      );

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message ?? "Login failed");
      }

      toast.success("Welcome back! 💪");

      // Redirect based on role
      const role = body.data?.role;
      if (role === "OWNER") router.push("/dashboard/owner");
      else if (role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard/member");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(245, 166, 35, 0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-dot opacity-20 pointer-events-none" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center shadow-gold">
              <Dumbbell className="w-5 h-5 text-dark" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-black text-xl gold-text">FitForge Pro</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-brand-gold hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-sm transition-all duration-200 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-dark-100 text-white/30">or login with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-xs text-white/50 font-medium mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="email"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-base pl-10"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-xs text-white/50 font-medium">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-brand-gold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-base pl-10 pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                {...register("rememberMe")}
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-dark-200 accent-brand-gold cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-white/50 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
