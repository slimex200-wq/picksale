/**
 * Unified countdown text format:
 * - 마감됨 → "마감"
 * - 24시간 미만 → "14시간 남음"
 * - 1일 이상 → "D-1", "D-6", "D-22"
 */
export function countdownText(endDate: string): string {
  // Use end of day in KST (+09:00) for accurate countdown
  const endMs = new Date(endDate + "T23:59:59+09:00").getTime();
  const diffMs = endMs - Date.now();
  if (diffMs <= 0) return "마감";
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}시간 남음`;
  const days = Math.ceil(diffMs / 86400000);
  return `D-${days}`;
}

export function isUrgentCountdown(countdown: string): boolean {
  return countdown.includes("시간") || countdown === "D-1" || countdown === "마감";
}

export function formatDate(d: string): string {
  const date = new Date(d);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}
