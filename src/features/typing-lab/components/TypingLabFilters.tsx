import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { ConfidenceBand, TypingLabEntry } from "../types";

export type SortOption = "Newest" | "Highest confidence" | "Most sourced";

export interface TypingLabFilterState {
  search: string;
  domain: string;
  era: string;
  nationality: string;
  proposedType: string;
  confidence: string;
  debatedOnly: boolean;
}

interface TypingLabFiltersProps {
  entries: TypingLabEntry[];
  filters: TypingLabFilterState;
  onFiltersChange: (filters: TypingLabFilterState) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  visibleCount: number;
}

const toOptionList = (values: string[]) => ["All", ...values];

export const typingLabDefaultFilters: TypingLabFilterState = {
  search: "",
  domain: "All",
  era: "All",
  nationality: "All",
  proposedType: "All",
  confidence: "All",
  debatedOnly: false,
};

export const confidenceFilterOptions: ConfidenceBand[] = ["High", "Medium", "Low"];

export const TypingLabFilters = ({
  entries,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  visibleCount,
}: TypingLabFiltersProps) => {
  const options = useMemo(() => {
    const unique = <T extends string>(get: (entry: TypingLabEntry) => T) =>
      Array.from(new Set(entries.map(get))).sort((a, b) => a.localeCompare(b));

    return {
      domain: toOptionList(unique((entry) => entry.domain)),
      era: toOptionList(unique((entry) => entry.era)),
      nationality: toOptionList(unique((entry) => entry.nationality)),
      proposedType: toOptionList(unique((entry) => entry.proposedType)),
      confidence: ["All", ...confidenceFilterOptions],
    };
  }, [entries]);

  const updateFilter = <K extends keyof TypingLabFilterState>(key: K, value: TypingLabFilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ ...typingLabDefaultFilters });
  };

  return (
    <section className="prism-container -mt-12" aria-label="Typing Lab filters">
      <div className="rounded-3xl border border-primary/20 bg-background/80 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex-1 space-y-2">
            <Label htmlFor="typing-lab-search" className="text-xs uppercase tracking-wide text-muted-foreground">
              Search
            </Label>
            <Input
              id="typing-lab-search"
              placeholder="Search by name or role"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="typing-lab-sort" className="text-xs uppercase tracking-wide text-muted-foreground">
              Sort
            </Label>
            <Select value={sort} onValueChange={(value) => onSortChange(value as SortOption)}>
              <SelectTrigger id="typing-lab-sort" className="w-56">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Newest">Newest</SelectItem>
                <SelectItem value="Highest confidence">Highest confidence</SelectItem>
                <SelectItem value="Most sourced">Most sourced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilterSelect
            label="Domain"
            value={filters.domain}
            onChange={(value) => updateFilter("domain", value)}
            options={options.domain}
          />
          <FilterSelect
            label="Era"
            value={filters.era}
            onChange={(value) => updateFilter("era", value)}
            options={options.era}
          />
          <FilterSelect
            label="Nationality"
            value={filters.nationality}
            onChange={(value) => updateFilter("nationality", value)}
            options={options.nationality}
          />
          <FilterSelect
            label="Proposed type"
            value={filters.proposedType}
            onChange={(value) => updateFilter("proposedType", value)}
            options={options.proposedType}
          />
          <FilterSelect
            label="Confidence"
            value={filters.confidence}
            onChange={(value) => updateFilter("confidence", value)}
            options={options.confidence}
          />
          <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Most debated
            </Label>
            <div className="flex items-center justify-between rounded-xl bg-background/80 p-3">
              <span className="text-sm font-medium text-foreground">Only show debated</span>
              <Switch
                checked={filters.debatedOnly}
                onCheckedChange={(value) => updateFilter("debatedOnly", value)}
                aria-label="Toggle most debated typings"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {visibleCount} of {entries.length} published typings. Filters update instantly.
          </p>
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>
    </section>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

const FilterSelect = ({ label, value, onChange, options }: FilterSelectProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
