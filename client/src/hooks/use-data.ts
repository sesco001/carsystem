import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// PROFILE
// ============================================
export function useProfile() {
  return useQuery({
    queryKey: [api.profiles.get.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.get.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(api.profiles.update.path, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.get.path] });
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });
}

// ============================================
// VEHICLES
// ============================================
export function useVehicles(filters?: { search?: string; location?: string }) {
  const queryKey = filters ? [api.vehicles.list.path, filters] : [api.vehicles.list.path];
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.vehicles.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.location) params.append("location", filters.location);
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return api.vehicles.list.responses[200].parse(await res.json());
    },
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: [api.vehicles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.vehicles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vehicle");
      return api.vehicles.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.vehicles.create.path, {
        method: api.vehicles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create vehicle");
      return api.vehicles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] });
      toast({ title: "Success", description: "Vehicle listed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to list vehicle", variant: "destructive" });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vehicles.delete.path, { id });
      const res = await fetch(url, {
        method: api.vehicles.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete vehicle");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] });
      toast({ title: "Success", description: "Vehicle deleted" });
    },
  });
}

// ============================================
// BOOKINGS
// ============================================
export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return api.bookings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => {
      // Ensure dates are ISO strings for transport
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return api.bookings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      toast({ title: "Success", description: "Booking request sent!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.bookings.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.bookings.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.bookings.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      toast({ title: "Success", description: "Booking status updated" });
    },
  });
}
