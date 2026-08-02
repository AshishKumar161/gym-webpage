"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Dumbbell,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    agreeToTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordStrengthLevels = [
  { min: 0, label: "Weak", color: "#ef4444" },
  { min: 25, label: "Fair", color: "#f59e0b" },
  { min: 50, label: "Good", color: "#84cc16" },
  { min: 75, label: "Strong", color: "#22c55e" },
];

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^a-zA-Z0-9]/.test(password)) score += 25;
  return score;
}

function RegisterPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: false },
  });

  const watchedPassword = watch("password", "");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            password: data.password,
            referralCode: data.referralCode,
            plan: planFromUrl,
          }),
        }
      );

      const body = await res.json();

      if (!res.ok) throw new Error(body.message ?? "Registration failed");

      toast.success(
        "Account created! Please check your email to verify your account. 📧"
      );
      router.push("/auth/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  const strength = getPasswordStrength(watchedPassword);
  const strengthLevel = passwordStrengthLevels
    .filter((l) => strength >= l.min)
    .at(-1)!;

  const handleGoogleRegister = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gold to-brand-fire flex items-center justify-center shadow-gold">
              <Dumbbell className="w-5 h-5 text-dark" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-black text-xl gold-text">FitForge Pro</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-white mb-2">
            Start Your Journey
          </h1>
          <p className="text-sm text-white/50">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-gold hover:underline font-medium">
              Sign in
            </Link>
          </p>
          {planFromUrl && (
            <div className="mt-3 badge-gold inline-flex">
              Registering for {planFromUrl.charAt(0).toUpperCase() + planFromUrl.slice(1)} plan
            </div>
          )}
        </div>

        <div className="glass-card p-8">
          {/* Google */}
          <button
            onClick={handleGoogleRegister}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-sm transition-all duration-200 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-dark-100 text-white/30">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-xs text-white/50 font-medium mb-2 block">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="firstName"
                    {...register("firstName")}
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    className="input-base pl-10"
                    aria-invalid={!!errors.firstName}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1" role="alert">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="text-xs text-white/50 font-medium mb-2 block">
                  Last Name
                </label>
                <input
                  id="lastName"
                  {...register("lastName")}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  className="input-base"
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1" role="alert">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="text-xs text-white/50 font-medium mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-email"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-base pl-10"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1" role="alert">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="text-xs text-white/50 font-medium mb-2 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="phone"
                  {...register("phone")}
                  type="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  className="input-base pl-10"
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1" role="alert">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="text-xs text-white/50 font-medium mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input-base pl-10 pr-10"
                  onChange={(e) => setPasswordValue(e.target.value)}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password Strength */}
              {watchedPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[25, 50, 75, 100].map((threshold) => (
                      <div
                        key={threshold}
                        className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                        style={{
                          background: strength >= threshold
                            ? strengthLevel?.color ?? "#ef4444"
                            : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthLevel?.color }}>
                    {strengthLevel?.label} password
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-red-400 text-xs mt-1" role="alert">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="text-xs text-white/50 font-medium mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="confirm-password"
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="input-base pl-10 pr-10"
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1" role="alert">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label htmlFor="referralCode" className="text-xs text-white/50 font-medium mb-2 block">
                Referral Code (Optional)
              </label>
              <input
                id="referralCode"
                {...register("referralCode")}
                type="text"
                placeholder="FRIEND2024"
                className="input-base"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                {...register("agreeToTerms")}
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-dark-200 accent-brand-gold cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-white/50 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-brand-gold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-brand-gold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-400 text-xs" role="alert">{errors.agreeToTerms.message}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center text-white/50 text-xs">
        <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mr-2" />
        Loading Registration Portal...
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}

