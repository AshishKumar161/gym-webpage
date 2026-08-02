import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

// Configure axios defaults
axios.defaults.withCredentials = true;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "MEMBER" | "TRAINER" | "ADMIN" | "OWNER";
  avatarUrl?: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  rewardPoints: number;
  memberships?: Array<{
    id: string;
    status: string;
    endDate: string;
    qrCode?: string;
    plan: {
      name: string;
      color: string;
    };
  }>;
  createdAt: string;
  heightCm?: number;
  weightKg?: number;
  fitnessGoal?: string;
  fitnessLevel?: string;
}


export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Profile query
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/auth/me`);
        return res.data?.data ?? null;
      } catch (err: any) {
        if (err.response?.status === 401) {
          return null; // Unauthenticated
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post(`${API_URL}/api/v1/auth/logout`);
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });

  const logout = () => logoutMutation.mutate();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role ?? null,
    isError,
    error,
    refetch,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
