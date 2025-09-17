import { Badge } from "@/components/ui/badge";
import type { ConfidenceBand } from "../types";

const confidenceVariant: Record<ConfidenceBand, { label: string; className: string }> = {
  High: { label: "High confidence", className: "bg-primary/10 text-primary border-primary/20" },
  Medium: { label: "Medium confidence", className: "bg-secondary/10 text-secondary border-secondary/20" },
  Low: { label: "Low confidence", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

interface ConfidenceBadgeProps {
  band: ConfidenceBand;
}

export const ConfidenceBadge = ({ band }: ConfidenceBadgeProps) => {
  const { label, className } = confidenceVariant[band];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
