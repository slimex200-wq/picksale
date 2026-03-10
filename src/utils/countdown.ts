/**
 * Unified countdown text format (date-only precision):
 * - 마감됨 → "마감"
 * - 오늘 마감 → "오늘 마감"
 * - 1일 이상 → "D-1", "D-6", "D-22"
 *
 * Note: DB stores end_date as `date` (no time component).
 * We never show hour/minute countdowns because the source data
 * does not provide exact end times.
 */
export function countdownText(endDate: string): string {
  const todayStr = getTodayKST();

  if (endDate < todayStr) return "마감";
  if (endDate === todayStr) return "오늘 마감";

  const diffMs =
    new Date(endDate + "T00:00:00+09:00").getTime() -
    new Date(todayStr + "T00:00:00+09:00").getTime();
  const days = Math.round(diffMs / 86400000);
  return `D-${days}`;
}

export function isUrgentCountdown(countdown: string): boolean {
  return countdown === "오늘 마감" || countdown === "D-1" || countdown === "마감";
}

export function formatDate(d: string): string {
  const date = new Date(d);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

/** Get today's date string in KST */
function getTodayKST(): string {
  const now = new Date();
  const year = now.toLocaleString("en-CA", { timeZone: "Asia/Seoul", year: "numeric" });
  const month = now.toLocaleString("en-CA", { timeZone: "Asia/Seoul", month: "2-digit" });
  const day = now.toLocaleString("en-CA", { timeZone: "Asia/Seoul", day: "2-digit" });
  return `${year}-${month}-${day}`;
}
