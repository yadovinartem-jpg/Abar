import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";
import { formatTime } from "@/lib/utils";

export default function RecentlyPlayed() {
  const tracks = useLibrary((s) => s.tracks);
  const ids = useLibrary((s) => s.recentlyPlayedIds);
  const loadQueue = usePlayer((s) => s.loadQueue);
  const currentId = usePlayer((s) => s.current?.id);

  const list = ids.map((id) => tracks.find((t) => t.id === id)!).filter(Boolean);

  const scroller = useRef<HTMLDivElement>(null);
  const [_, force] = useState(0);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  const cols: typeof list[] = [];
  for (let i = 0; i < list.length; i += 3) cols.push(list.slice(i, i + 3));

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Недавно прослушанные</h2>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scrollBy(-1)} className="size-8 rounded-full bg-elevated hover:bg-subtle grid place-items-center">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => scrollBy(1)} className="size-8 rounded-full bg-elevated hover:bg-subtle grid place-items-center">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={scroller} onScroll={() => force((n) => n + 1)} className="overflow-x-auto scroll-smooth">
        <div className="flex gap-3 min-w-max pb-2">
          {cols.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-2 w-[340px]">
              {col.map((t) => {
                const isCurr = t.id === currentId;
                return (
                  <button
                    key={t.id}
                    onClick={() => loadQueue(list, list.findIndex((x) => x.id === t.id))}
                    className="group flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-elevated/70 text-left transition-colors"
                  >
                    <div className="relative size-12 rounded-md overflow-hidden bg-elevated shrink-0">
                      <img src={t.cover} alt="" className="size-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 grid place-items-center transition-opacity">
                        <Play className="size-4 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isCurr ? "text-brand" : ""}`}>{t.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">{formatTime(t.duration)}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
