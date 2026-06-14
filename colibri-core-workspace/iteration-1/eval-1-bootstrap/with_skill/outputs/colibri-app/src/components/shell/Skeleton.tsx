export function Skeleton() {
  return (
    <div className="flex flex-col gap-4 p-5 animate-skeleton">
      <div className="h-8 w-48 rounded-xl bg-colibri-subtle" />
      <div className="h-4 w-full rounded-lg bg-colibri-subtle" />
      <div className="h-4 w-3/4 rounded-lg bg-colibri-subtle" />
      <div className="h-32 w-full rounded-2xl bg-colibri-subtle mt-4" />
      <div className="h-4 w-1/2 rounded-lg bg-colibri-subtle" />
    </div>
  );
}
