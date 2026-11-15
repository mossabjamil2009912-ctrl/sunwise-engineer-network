import { queryOptions } from "@tanstack/react-query";
import { getEngineer, getCatalog, getReviewInfo, listEngineers } from "@/lib/acts.functions";

export const catalogQuery = () =>
  queryOptions({ queryKey: ["catalog"], queryFn: () => getCatalog(), staleTime: 5 * 60_000 });
export const engineersQuery = () =>
  queryOptions({ queryKey: ["engineers"], queryFn: () => listEngineers(), staleTime: 60_000 });
export const engineerQuery = (id: string) =>
  queryOptions({ queryKey: ["engineer", id], queryFn: () => getEngineer({ data: { id } }), staleTime: 60_000 });
export const reviewInfoQuery = (token: string) =>
  queryOptions({ queryKey: ["review-info", token], queryFn: () => getReviewInfo({ data: { token } }) });
