import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import {
  fetchProspects,
  IN_PROGRESS_STATUSES,
  type ProspectListResponse,
  type SortField,
  type SortOrder,
  type StatusFilter,
} from "@/lib/prospects";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const LIMIT = 20;

export function useProspects() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortField>("created_at");
  const [order, setOrder] = useState<SortOrder>("desc");

  const search = useDebouncedValue(searchInput, 300);

  const [data, setData] = useState<ProspectListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await fetchProspects({ page, limit: LIMIT, search, status, sort, order });
        setData(result);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load emails. Please try again.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, search, status, sort, order]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 whenever the query itself changes underneath the user.
  useEffect(() => {
    setPage(1);
  }, [search, status, sort, order]);

  const hasInProgressRows = !!data?.items.some((p) => IN_PROGRESS_STATUSES.includes(p.status));
  useEffect(() => {
    if (!hasInProgressRows) return;
    const interval = setInterval(() => load(true), 3000);
    return () => clearInterval(interval);
  }, [hasInProgressRows, load]);

  function toggleSort(field: SortField) {
    if (field === sort) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder(field === "created_at" ? "desc" : "asc");
    }
  }

  return {
    data,
    loading,
    error,
    page,
    setPage,
    searchInput,
    setSearchInput,
    status,
    setStatus,
    sort,
    order,
    toggleSort,
    refetch: () => load(),
  };
}
