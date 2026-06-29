const team = [
  {
    name: "FORSITY",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  },
  {
    name: "ZERROW",
    avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop",
  },
  {
    name: "Котейка",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
];

export default function Footer() {
  return (
    <footer className="pt-12 pb-4 border-t border-border/40 mt-12">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
        {team.map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <img src={m.avatar} alt="" className="size-8 rounded-full object-cover ring-1 ring-border/60" />
            <span className="text-sm font-semibold tracking-wide text-foreground/80">{m.name}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>©</span>
        <span className="size-5 rounded-full bg-gradient-to-br from-brand to-brand/40 grid place-items-center text-[10px] font-extrabold text-white">
          A
        </span>
        <span className="font-bold tracking-wide text-foreground/70">ABAR</span>
        <span className="opacity-50">·</span>
        <span className="font-medium">FORSITY Interteiment</span>
        <span className="opacity-50">·</span>
        <span>2026</span>
        <span className="opacity-50">·</span>
        <span className="flex items-center gap-1">
          Russia
          <span className="inline-flex w-4 h-3 overflow-hidden rounded-[2px] ring-1 ring-border/60">
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#0039a6]" />
            <span className="flex-1 bg-[#d52b1e]" />
          </span>
        </span>
      </div>
    </footer>
  );
}
