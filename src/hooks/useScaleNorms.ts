import { useQuery } from "@tanstack/react-query";
import { invokeEdge } from "@/lib/edge-functions";
import type { ScaleNorm } from "./useAssessmentKpis";

export const useScaleNorms = () => {
  return useQuery({
    queryKey: ["scale-norms"],
    queryFn: async () => {
      const response = await invokeEdge(`analytics-get?block=scale_norms`);

      if (!response.ok) {
        throw new Error(`Scale norms fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return (result.norms || []) as ScaleNorm[];
    },
    staleTime: 1000 * 60, // 1 minute
  });
};
