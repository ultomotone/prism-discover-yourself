import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { TypingLabHero } from "@/features/typing-lab/components/TypingLabHero";
import {
  TypingLabFilters,
  type SortOption,
  type TypingLabFilterState,
  confidenceFilterOptions,
  typingLabDefaultFilters,
} from "@/features/typing-lab/components/TypingLabFilters";
import { TypingLabFeatured } from "@/features/typing-lab/components/TypingLabFeatured";
import { TypingLabLegend } from "@/features/typing-lab/components/TypingLabLegend";
import { TypingLabMethodology } from "@/features/typing-lab/components/TypingLabMethodology";
import { TypingLabGrid } from "@/features/typing-lab/components/TypingLabGrid";
import { TypingLabGovernance } from "@/features/typing-lab/components/TypingLabGovernance";
import { typingLabEntries } from "@/features/typing-lab/data";
import { filterAndSortEntries } from "@/features/typing-lab/utils";

const domainOptions = new Set(typingLabEntries.map((entry) => entry.domain));
const eraOptions = new Set(typingLabEntries.map((entry) => entry.era));
const nationalityOptions = new Set(typingLabEntries.map((entry) => entry.nationality));
const proposedTypeOptions = new Set(typingLabEntries.map((entry) => entry.proposedType));
const confidenceOptions = new Set(confidenceFilterOptions);

const parseFiltersFromParams = (params: URLSearchParams): TypingLabFilterState => {
  const normalize = (
    key: keyof Omit<TypingLabFilterState, "search" | "debatedOnly">,
    allowed: Set<string>
  ) => {
    const raw = params.get(key);
    if (!raw || raw === typingLabDefaultFilters[key]) {
      return typingLabDefaultFilters[key];
    }
    return allowed.has(raw) ? raw : typingLabDefaultFilters[key];
  };

  return {
    search: params.get("search") ?? typingLabDefaultFilters.search,
    domain: normalize("domain", domainOptions),
    era: normalize("era", eraOptions),
    nationality: normalize("nationality", nationalityOptions),
    proposedType: normalize("proposedType", proposedTypeOptions),
    confidence: normalize("confidence", confidenceOptions),
    debatedOnly: params.get("debated") === "1",
  };
};

const parseSortFromParams = (params: URLSearchParams): SortOption => {
  const raw = params.get("sort");
  if (raw === "Highest confidence" || raw === "Most sourced") {
    return raw;
  }
  return "Newest";
};

const buildSearchParams = (filters: TypingLabFilterState, sort: SortOption) => {
  const params = new URLSearchParams();

  const setIfNeeded = (key: keyof Omit<TypingLabFilterState, "search" | "debatedOnly">, allowedValue: string) => {
    if (allowedValue !== typingLabDefaultFilters[key]) {
      params.set(key, allowedValue);
    }
  };

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }
  setIfNeeded("domain", filters.domain);
  setIfNeeded("era", filters.era);
  setIfNeeded("nationality", filters.nationality);
  setIfNeeded("proposedType", filters.proposedType);
  setIfNeeded("confidence", filters.confidence);
  if (filters.debatedOnly) {
    params.set("debated", "1");
  }
  if (sort !== "Newest") {
    params.set("sort", sort);
  }

  return params;
};

const TypingLab = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams]
  );

  const sort = useMemo(() => parseSortFromParams(searchParams), [searchParams]);

  useEffect(() => {
    const canonical = buildSearchParams(filters, sort);
    if (canonical.toString() !== searchParams.toString()) {
      setSearchParams(canonical, { replace: true });
    }
  }, [filters, sort, searchParams, setSearchParams]);

  const applyStateToQuery = useCallback(
    (nextFilters: TypingLabFilterState, nextSort: SortOption) => {
      const nextParams = buildSearchParams(nextFilters, nextSort);
      if (nextParams.toString() === searchParams.toString()) {
        return;
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleFiltersChange = useCallback(
    (nextFilters: TypingLabFilterState) => {
      applyStateToQuery(nextFilters, sort);
    },
    [applyStateToQuery, sort]
  );

  const handleSortChange = useCallback(
    (nextSort: SortOption) => {
      applyStateToQuery(filters, nextSort);
    },
    [applyStateToQuery, filters]
  );

  const filteredEntries = useMemo(
    () => filterAndSortEntries(typingLabEntries, filters, sort),
    [filters, sort]
  );

  const featuredEntries = useMemo(
    () => typingLabEntries.filter((entry) => entry.featured),
    []
  );

  return (
    <div className="bg-background text-foreground">
      <TypingLabHero />
      <div className="prism-container hidden xl:block">
        <div className="sticky top-28 flex justify-end">
          <a
            href="#method"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:text-primary/80"
          >
            How typings are made
          </a>
        </div>
      </div>
      <TypingLabFilters
        entries={typingLabEntries}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sort={sort}
        onSortChange={handleSortChange}
        visibleCount={filteredEntries.length}
      />
      <TypingLabFeatured entries={featuredEntries} />
      <TypingLabLegend />
      <TypingLabMethodology />
      <TypingLabGrid entries={filteredEntries} />
      <TypingLabGovernance />
    </div>
  );
};

export default TypingLab;
