import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(d);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): {
  category: string;
  color: string;
} {
  if (bmi < 18.5) return { category: "Underweight", color: "#60a5fa" };
  if (bmi < 25) return { category: "Normal", color: "#22c55e" };
  if (bmi < 30) return { category: "Overweight", color: "#f59e0b" };
  return { category: "Obese", color: "#ef4444" };
}

export function calculateDailyCalories(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: "male" | "female",
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
): number {
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function calculateWaterIntake(weightKg: number): number {
  return parseFloat((weightKg * 0.033).toFixed(1));
}

export function calculateBodyFat(
  bmi: number,
  ageYears: number,
  gender: "male" | "female"
): number {
  // Deurenberg formula
  const genderFactor = gender === "male" ? 1 : 0;
  const bodyFat = 1.2 * bmi + 0.23 * ageYears - 10.8 * genderFactor - 5.4;
  return parseFloat(Math.max(0, bodyFat).toFixed(1));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
