import { useMutation, useQuery } from "@tanstack/react-query";
import { api, buildUrl, type CheckoutRequest } from "@shared/routes";

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CheckoutRequest) => {
      const validated = api.orders.create.input.parse(data);
      const res = await fetch(api.orders.create.path, {
        method: api.orders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.orders.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("حدث خطأ أثناء إتمام الطلب"); // Error occurred during checkout
      }
      return api.orders.create.responses[201].parse(await res.json());
    },
  });
}

export function useOrder(id: number | null) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.orders.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("فشل في جلب تفاصيل الطلب");
      const data = await res.json();
      return api.orders.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}
