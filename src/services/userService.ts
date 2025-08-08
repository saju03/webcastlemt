import { api } from "@/lib/axios";

export async function fetchSetupStatus(): Promise<{ hasPhone: boolean }> {
  const response = await api.get(`/api/user/setup-status`);
  return response.data as { hasPhone: boolean };
}

export async function saveUserPhone(phoneE164: string): Promise<void> {
  await api.post("/api/user/setup", { phone: phoneE164 });
}


