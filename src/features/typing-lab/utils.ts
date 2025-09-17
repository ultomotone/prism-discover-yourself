import type { TypingLabEntry } from "./types";
import type { SortOption, TypingLabFilterState } from "./components/TypingLabFilters";

const confidenceRank: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const filterAndSortEntries = (
  entries: TypingLabEntry[],
  filters: TypingLabFilterState,
  sort: SortOption
) => {
  const matches = (entry: TypingLabEntry) => {
    if (filters.search.trim()) {
      const search = filters.search.toLowerCase();
      if (
        ![
          entry.name,
          entry.role,
          entry.domain,
          entry.proposedType,
          entry.nationality,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }
    }

    if (filters.domain !== "All" && entry.domain !== filters.domain) {
      return false;
    }
    if (filters.era !== "All" && entry.era !== filters.era) {
      return false;
    }
    if (filters.nationality !== "All" && entry.nationality !== filters.nationality) {
      return false;
    }
    if (filters.proposedType !== "All" && entry.proposedType !== filters.proposedType) {
      return false;
    }
    if (filters.confidence !== "All" && entry.confidenceBand !== filters.confidence) {
      return false;
    }
    if (filters.debatedOnly && !entry.debated) {
      return false;
    }
    return true;
  };

  const filteredEntries = entries.filter(matches);

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sort === "Newest") {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
    if (sort === "Highest confidence") {
      const bandDelta = (confidenceRank[b.confidenceBand] ?? 0) - (confidenceRank[a.confidenceBand] ?? 0);
      if (bandDelta !== 0) return bandDelta;
      return b.top2Gap - a.top2Gap;
    }
    if (sort === "Most sourced") {
      return b.evidence.length - a.evidence.length;
    }
    return 0;
  });

  return sortedEntries;
};
