"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CreditCard, Calendar, ShieldCheck, CheckCircle2, History, Receipt, ShieldAlert } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Membership {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  plan: {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    color: string;
    features: string[];
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  gateway: string;
  createdAt: string;
  membership?: {
    plan: {
      name: string;
    };
  };
}

const AVAILABLE_PLANS = [
  {
    id: "plan_starter",
    name: "Starter",
    price: 99900, // in paise (₹999)
    color: "#60a5fa",
    features: [
      "Access to gym floor & cardio room",
      "1 Complimentary trainer session",
      "Locker & shower facilities",
      "Standard support",
    ],
  },
  {
    id: "plan_elite",
    name: "Elite",
    price: 249900, // in paise (₹2,499)
    color: "#fbbf24",
    features: [
      "Full gym & group class access",
      "4 Trainer sessions / month",
      "Diet & workout plans included",
      "Sauna & steam room access",
      "Priority booking & support",
    ],
  },
  {
    id: "plan_pro",
    name: "Forge Pro",
    price: 799900, // in paise (₹7,999)
    color: "#ef4444",
    features: [
      "24/7 VIP Gym & Studio Access",
      "Unlimited group classes",
      "Personal trainer assigned (1-on-1)",
      "Daily progress audits",
      "Complimentary supplement bar access",
      "Premium locker & parking space",
    ],
  },
];

export default function MembershipPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch memberships
  const { data: membershipsData } = useQuery<{ items: Membership[] }>({
    queryKey: ["memberships", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/memberships`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Fetch payments
  const { data: paymentsData } = useQuery<{ items: Payment[] }>({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/v1/payments`);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Purchase plan mutation
  const purchaseMutation = useMutation({
    mutationFn: async (planId: string) => {
      // 1. Create membership
      const memRes = await axios.post(`${API_URL}/api/v1/memberships`, { planId, months: 1 });
      const membership = memRes.data;

      // 2. Process checkout/payment record
      await axios.post(`${API_URL}/api/v1/payments`, {
        amount: AVAILABLE_PLANS.find(p => p.id === planId)?.price ?? 99900,
        membershipId: membership.id,
        gateway: "RAZORPAY",
        description: `Purchase of ${AVAILABLE_PLANS.find(p => p.id === planId)?.name} Plan`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberships", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["payments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Membership activated successfully!");
      setSelectedPlan(null);
    },
    onError: () => {
      toast.error("Purchase failed. Please try again.");
    },
  });

  const activeMembership = membershipsData?.items.find((m) => m.status === "ACTIVE");

  return (
    <div className="space-y-10">
      {/* Overview Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">My Membership</h1>
        <p className="text-sm text-white/50">Manage your subscription, view payment history, or upgrade your plan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Active Plan Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 relative overflow-hidden">
            {/* Background highlight */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeMembership?.plan.color ?? "#fff" }}
            />

            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
              Subscription Status
            </h3>

            {activeMembership ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span
                      className="px-2 py-0.5 text-xxs font-bold uppercase rounded tracking-wider"
                      style={{
                        backgroundColor: `${activeMembership.plan.color}15`,
                        color: activeMembership.plan.color,
                        border: `1px solid ${activeMembership.plan.color}30`,
                      }}
                    >
                      {activeMembership.plan.name} Package
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1.5">{activeMembership.plan.name} Plan</h2>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-xs text-white/40 block">Billing Period</span>
                    <span className="text-sm font-medium text-white flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      {formatDate(activeMembership.startDate)} — {formatDate(activeMembership.endDate)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">Status: Active</p>
                      <p className="text-xxs text-white/40">You have full access to all tier features.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">Auto-Renew: On</p>
                      <p className="text-xxs text-white/40">Renews on {formatDate(activeMembership.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h4 className="text-white font-bold text-base mb-1">No Active Subscription</h4>
                <p className="text-xs text-white/40 mb-6">Choose a plan below to activate your premium gym access.</p>
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Select a Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {AVAILABLE_PLANS.map((plan) => {
                const isActive = activeMembership?.plan.id === plan.id;
                const isSelected = selectedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`glass-card p-6 flex flex-col justify-between transition-all duration-300 relative ${
                      isActive ? "border-brand-gold bg-brand-gold/5 scale-[1.02]" : "border-white/5"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white text-base">{plan.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mb-6">
                        <span className="text-2xl font-black text-white">
                          {formatCurrency(plan.price / 100, "INR")}
                        </span>
                        <span className="text-white/40 text-xs font-medium">/month</span>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xxs text-white/60 leading-tight">
                            <span className="text-brand-gold mt-0.5">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => setSelectedPlan(plan.id)}
                        disabled={purchaseMutation.isPending}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 ${
                          isSelected
                            ? "bg-brand-gold text-dark shadow-gold"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {isSelected ? "Confirm Purchase" : "Select"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 glass-card border-brand-gold/30 bg-brand-gold/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">Confirm Subscription Purchase</h4>
                  <p className="text-xxs text-white/50 mt-1">
                    You are purchasing the 1-month {AVAILABLE_PLANS.find(p => p.id === selectedPlan)?.name} plan. Payment processed via Razorpay simulation.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="btn-ghost border border-white/10 text-xs px-4 py-2 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => purchaseMutation.mutate(selectedPlan!)}
                    disabled={purchaseMutation.isPending}
                    className="btn-primary text-xs px-5 py-2 font-bold"
                  >
                    {purchaseMutation.isPending ? "Activating..." : "Pay Now"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Payment Billing History */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-gold" />
              Billing Invoices
            </h3>

            {paymentsData?.items && paymentsData.items.length > 0 ? (
              <div className="divide-y divide-white/5 space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {paymentsData.items.map((payment, i) => (
                  <div key={payment.id} className={`flex items-center justify-between pt-4 ${i === 0 && "pt-0"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center text-white/40">
                        <Receipt className="w-5 h-5 text-brand-gold" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-white">
                          {payment.membership?.plan.name ?? "Gym Plan"} Subscription
                        </h5>
                        <p className="text-xxs text-white/40 mt-0.5">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-white">
                        {formatCurrency(payment.amount / 100, "INR")}
                      </div>
                      <span className="inline-block text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded mt-0.5">
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 text-center py-6">No previous invoices found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
