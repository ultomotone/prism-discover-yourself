import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Filters {
  dateRange: { preset: string };
  overlay: string;
  confidence: string;
  primaryType: string;
  device: string;
}

interface AdminFiltersProps {
  filters: {
    dateRange: { preset: string };
    overlay: string;
    confidence: string;
    primaryType: string;
    device: string;
  };
  onFiltersChange: (filters: any) => void;
  onRefresh: () => void;
  loading: boolean;
}

const typeOptions = [
  "LIE", "LII", "SEE", "SEI", "ESE", "ESI", "LSE", "LSI",
  "SLE", "SLI", "IEE", "IEI", "EIE", "EII", "ILE", "ILI"
];

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading
}) => {
  const updateFilter = (key: string, value: string) => {
    if (key === 'datePreset') {
      onFiltersChange({
        ...filters,
        dateRange: { preset: value }
      });
    } else {
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[150px]">
            <Select
              value={filters.dateRange.preset}
              onValueChange={(value) => updateFilter('datePreset', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <Select
              value={filters.overlay}
              onValueChange={(value) => updateFilter('overlay', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Overlay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Overlays</SelectItem>
                <SelectItem value="+">Reg− (N+) - Stressed</SelectItem>
                <SelectItem value="0">Reg0 (N0) - Neutral</SelectItem>
                <SelectItem value="-">Reg+ (N−) - Calm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <Select
              value={filters.confidence}
              onValueChange={(value) => updateFilter('confidence', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <Select
              value={filters.primaryType}
              onValueChange={(value) => updateFilter('primaryType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <Select
              value={filters.device}
              onValueChange={(value) => updateFilter('device', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};