import { useMutation, useQuery } from "@tanstack/react-query";
import { type Order, type CheckoutRequest } from "@shared/schema";

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CheckoutRequest) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "حدث خطأ أثناء إتمام الطلب");
      }
      
      return res.json() as Promise<Order>;
    },
  });
}

export function useOrder(id: number | null) {
  return useQuery({
    queryKey: [`/api/orders/${id}`],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/orders/${id}`);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("فشل في جلب تفاصيل الطلب");
      
      return res.json() as Promise<Order>;
    },
    enabled: !!id,
  });
}