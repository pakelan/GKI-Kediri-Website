import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { CHURCH } from "@/lib/content";
import type { SiteSettings } from "@/lib/types";

export function useSettings(): SiteSettings {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiGet<SiteSettings>("/settings"),
    staleTime: 5 * 60 * 1000,
  });
  return {
    phone: data?.phone || CHURCH.phone,
    address: data?.address || CHURCH.address,
    email: data?.email || CHURCH.email,
    instagram: data?.instagram || CHURCH.instagram,
    youtube: data?.youtube || CHURCH.youtube,
    office_hours: data?.office_hours || CHURCH.officeHours,
  };
}

export function waLink(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
  return `https://wa.me/${digits}`;
}
