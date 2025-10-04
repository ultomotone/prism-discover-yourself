import { useQuery } from "@tanstack/react-query";
import { invokeEdge } from "@/lib/edge-functions";

export interface StateOverlayData {
  pct_n_plus: number | string;
  pct_n0: number | string;
  pct_n_minus: number | string;
  mean_stress: number | string;
  mean_mood: number | string;
  mean_sleep: number | string;
  mean_focus: number | string;
  mean_time: number | string;
  r_state_traitn: number | string;
  conf_mean_nplus: number | string;
  conf_mean_n0: number | string;
  conf_mean_nminus: number | string;
  topgap_mean_nplus: number | string;
  topgap_mean_n0: number | string;
  topgap_mean_nminus: number | string;
}

export const useStateOverlayKpis = (period: "all" | "7d" | "30d" | "60d" | "90d" | "365d" = "all") => {
  return useQuery({
    queryKey: ["state-overlay-kpis", period],
    queryFn: async () => {
      const res = await invokeEdge(`analytics-get?block=state_overlay&period=${period}`);
      if (!res.ok) {
        throw new Error(`State overlay fetch failed: ${res.statusText}`);
      }
      const json = await res.json();
      return json as { state_overlay: StateOverlayData | null; series?: any[] };
    },
    staleTime: 60_000,
  });
};
