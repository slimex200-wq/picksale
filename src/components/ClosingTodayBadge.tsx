export default function ClosingTodayBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md bg-closing-today-bg text-closing-today"
      style={{ padding: "4px 10px", borderRadius: 6 }}
    >
      <span
        className="block w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse"
        aria-hidden="true"
      />
      <span className="text-[13px] font-bold leading-none">오늘 마감</span>
    </span>
  );
}
