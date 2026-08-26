export default function InsightCallout({
  kicker = "No radar",
  children,
}: {
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="insight-destaque">
      <p className="insight-destaque__kicker">{kicker}</p>
      <p className="insight-destaque__texto">{children}</p>
    </div>
  );
}
