import { useQuery } from "@tanstack/react-query";
import { invokeEdge } from "@/lib/edge-functions";
import type { NeuroticismData, NeuroticismCorrelation } from "./useAssessmentKpis";

export const useNeuroticismKpis = () => {
  return useQuery({
    queryKey: ["neuroticism-kpis"],
    queryFn: async () => {
      const response = await invokeEdge(`analytics-get?block=neuroticism`);

      if (!response.ok) {
        throw new Error(`Neuroticism KPIs fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        neuroticism: result.neuroticism as NeuroticismData | null,
        topCorr: (result.top_corr || []) as NeuroticismCorrelation[]
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
};
