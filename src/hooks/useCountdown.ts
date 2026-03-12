import { useState, useEffect } from "react";

/**
 * Returns a live countdown string that updates every 60s.
 * Assumes end_date is a YYYY-MM-DD string and deadline is KST midnight (23:59:59).
 *
 * Rules:
 * - Past deadline → "마감"
 * - >24h remaining → "D-N"
 * - 3h–24h → "N시간 남음"
 * - 1h–3h → "N시간 남음" (urgent)
 * - <1h → "N분 남음" (urgent)
 */
function calcCountdown(endDate: string): { text: string; isUrgent: boolean } {
  // Deadline = end of end_date in KST = start of next day in KST
  const deadlineMs = new Date(endDate + "T23:59:59+09:00").getTime() + 1000; // effectively midnight next day
  const nowMs = Date.now();
  const diffMs = deadlineMs - nowMs;

  if (diffMs <= 0) {
    return { text: "마감", isUrgent: true };
  }

  const diffHours = diffMs / 3600000;
  const diffDays = Math.ceil(diffMs / 86400000);

  // More than 24 hours → D-N
  if (diffHours > 24) {
    return { text: `D-${diffDays - 1 || 1}`, isUrgent: false };
  }

  // 1h – 24h → "N시간 남음"
  if (diffHours >= 1) {
    const hours = Math.floor(diffHours);
    return { text: `${hours}시간 남음`, isUrgent: diffHours <= 3 };
  }

  // < 1h → "N분 남음"
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return { text: `${mins}분 남음`, isUrgent: true };
}

export function useCountdown(endDate: string) {
  const [state, setState] = useState(() => calcCountdown(endDate));

  useEffect(() => {
    setState(calcCountdown(endDate));
    const id = setInterval(() => setState(calcCountdown(endDate)), 60_000);
    return () => clearInterval(id);
  }, [endDate]);

  return state;
}
