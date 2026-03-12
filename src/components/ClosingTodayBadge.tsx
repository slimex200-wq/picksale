import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  endDate: string;
  size?: "sm" | "md";
}

export default function ClosingTodayBadge({ endDate, size = "md" }: Props) {
  const { text, isUrgent } = useCountdown(endDate);

  const isSm = size === "sm";
  const fontSize = isSm ? "10px" : "11px";
  const padding = isSm ? "1px 5px" : "2px 8px";
  const dotSize = isSm ? "w-1 h-1" : "w-1.5 h-1.5";

  // 3시간 이내 → destructive (red), otherwise → closing-today (amber)
  const colorClass = isUrgent
    ? "bg-destructive/10 text-destructive"
    : "bg-closing-today-bg text-closing-today";
  const dotColor = isUrgent ? "bg-destructive" : "bg-closing-today";
  const pulseClass = isUrgent ? "animate-closing-pulse" : "animate-closing-pulse";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md ${colorClass} shrink-0`}
      style={{ fontSize, fontWeight: 700, padding }}
    >
      <span className={`${dotSize} rounded-full ${dotColor} ${pulseClass}`} />
      {text}
    </span>
  );
}
