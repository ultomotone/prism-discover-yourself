import { useQuery } from "@tanstack/react-query";
import { invokeEdge } from "@/lib/edge-functions";
import type { ComponentKPIData } from "./useAssessmentKpis";

export const useComponentKpis = (resultsVersion: string = "v1.2.1") => {
  return useQuery({
    queryKey: ["component-kpis", resultsVersion],
    queryFn: async () => {
      const response = await invokeEdge(
        `analytics-get?block=component_kpis&ver=${resultsVersion}`
      );

      if (!response.ok) {
        throw new Error(`Component KPIs fetch failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        gates: (result.gates || []) as ComponentKPIData[],
        fit: result.fit || [],
        invariance: result.invariance || null
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
};
