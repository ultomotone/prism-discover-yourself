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
      
      {/* Table of Contents */}
      <div className="prism-container py-8">
        <div className="mx-auto max-w-4xl">
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#browse" className="text-primary hover:text-primary/80 font-medium">
              Browse Profiles
            </a>
            <a href="#legend" className="text-muted-foreground hover:text-foreground">
              Legend
            </a>
            <a href="#method" className="text-muted-foreground hover:text-foreground">
              Methodology
            </a>
            <a href="#governance" className="text-muted-foreground hover:text-foreground">
              Governance
            </a>
          </nav>
        </div>
      </div>

      <div id="browse">
        <TypingLabFilters
          entries={typingLabEntries}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sort={sort}
          onSortChange={handleSortChange}
          visibleCount={filteredEntries.length}
        />
        
        {/* Search Results directly under filters */}
        <TypingLabGrid entries={filteredEntries} />
      </div>
      
      <TypingLabFeatured entries={featuredEntries} />
      <div id="legend">
        <TypingLabLegend />
      </div>
      <div id="method">
        <TypingLabMethodology />
      </div>
      <div id="governance">
        <TypingLabGovernance />
      </div>
    </div>
  );
};

export default TypingLab;
