import { useEffect, useState } from "react";
import type { Review } from "@/lib/acts.functions";

// Visitor ratings kept on this device and merged with CRM/sample reviews.
const key = (id: string) => `acts-reviews-${id}`;
const read = (id: string): Review[] => { try { return JSON.parse(localStorage.getItem(key(id)) || "[]"); } catch { return []; } };

export function useLocalReviews(id: string) {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => { setList(read(id)); }, [id]);
  const add = (rating: number, name: string, comment: string) => {
    const r: Review = { id: crypto.randomUUID(), rating, quality: rating, punctuality: rating, professionalism: rating, responsiveness: rating, comment, reviewer_name: name || "زائر", created_at: new Date().toISOString() } as Review;
    const next = [r, ...read(id)];
    localStorage.setItem(key(id), JSON.stringify(next));
    setList(next);
  };
  return { list, add };
}
