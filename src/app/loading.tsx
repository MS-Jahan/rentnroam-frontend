export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-16">
      <div className="h-10 w-48 rounded bg-moss/10" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl bg-moss/10" />
        ))}
      </div>
    </div>
  );
}
