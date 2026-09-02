export default function CardGridSkeleton({ count = 12 }) {
  return (
    <div className="flex flex-wrap gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-40 sm:w-48 shrink-0">
          <div className="aspect-[2/3] rounded-lg bg-panel animate-pulse" />
          <div className="h-3 w-3/4 bg-panel rounded mt-2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
