import { queryOptions } from "@tanstack/react-query";
import { getEngineer, getKwhPrice, getReviewInfo, listEngineers } from "@/lib/acts.functions";

export const kwhPriceQuery = () =>
  queryOptions({ queryKey: ["kwh-price"], queryFn: () => getKwhPrice(), staleTime: 10 * 60_000 });
export const engineersQuery = () =>
  queryOptions({ queryKey: ["engineers"], queryFn: () => listEngineers(), staleTime: 60_000 });
export const engineerQuery = (id: string) =>
  queryOptions({ queryKey: ["engineer", id], queryFn: () => getEngineer({ data: { id } }), staleTime: 60_000 });
export const reviewInfoQuery = (token: string) =>
  queryOptions({ queryKey: ["review-info", token], queryFn: () => getReviewInfo({ data: { token } }) });
