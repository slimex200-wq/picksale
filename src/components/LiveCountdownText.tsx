import { useCountdown } from "@/hooks/useCountdown";

interface Props {
  endDate: string;
  className?: string;
}

/** Displays live remaining time text (e.g. "12시간 남음", "47분 남음"). Red when ≤3h. */
export default function LiveCountdownText({ endDate, className = "" }: Props) {
  const { text, isUrgent } = useCountdown(endDate);

  return (
    <span
      className={`font-display whitespace-nowrap ${
        isUrgent ? "text-destructive font-semibold" : "text-primary font-semibold"
      } ${className}`}
    >
      {text}
    </span>
  );
}
