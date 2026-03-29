import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema"; // تأكد من المسار حسب مشروعك
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. أهم جزء: جلب بيانات المستخدم "الحقيقية" من السيرفر فور فتح الموقع
  const { data: user, error, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user");
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("فشل جلب بيانات المستخدم");
        return await res.json();
      } catch (e) {
        return null;
      }
    },
  });

  // 2. دالة تسجيل الدخول
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "تم تسجيل الدخول بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "فشل الدخول", description: error.message, variant: "destructive" });
    }
  });

  // 3. دالة تسجيل الخروج
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({ title: "تم تسجيل الخروج" });
    }
  });

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, error, loginMutation, logoutMutation, registerMutation: {} as any }}>
      {children}
    </AuthContext.Provider>
  );
}

// هوك (Hook) لاستخدام الصلاحيات في أي صفحة بسهولة
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}