export default function ClosingTodayBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const styles = size === "sm"
    ? { padding: "2px 6px", fontSize: "10px" }
    : { padding: "4px 10px", fontSize: "13px" };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full"
      style={{
        ...styles,
        background: "#FFF3E0",
        color: "#E65100",
        fontWeight: 600,
      }}
    >
      <span
        className="block w-1.5 h-1.5 rounded-full animate-closing-pulse"
        style={{ background: "#E65100" }}
        aria-hidden="true"
      />
      <span className="leading-none">오늘 마감</span>
    </span>
  );
}
