export function Watermark() {
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-3 right-4 z-40 pointer-events-none select-none"
    >
      <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40">
        Built by Er. Pankaj Kumar
      </span>
    </div>
  );
}
