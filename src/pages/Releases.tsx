import { Calendar } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";

export default function Releases() {
  const playlists = useLibrary((s) => s.playlists);
  const tracks = useLibrary((s) => s.tracks);
  const loadQueue = usePlayer((s) => s.loadQueue);
  const recent = [...playlists].sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="size-5 text-brand" /> Релизы
      </h1>

      <div className="bg-panel border border-border/50 rounded-2xl p-5">
        <h2 className="font-bold mb-4">Свежие релизы</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recent.slice(0, 8).map((p) => {
            const list = p.trackIds.map((id) => tracks.find((t) => t.id === id)!).filter(Boolean);
            return (
              <button
                key={p.id}
                onClick={() => loadQueue(list, 0)}
                className="group text-left"
              >
                <div className="aspect-square rounded-xl overflow-hidden">
                  <img src={p.cover} alt="" className="size-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="mt-2 text-sm font-semibold truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.year}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-panel border border-border/50 rounded-2xl p-5">
        <h2 className="font-bold mb-4">Календарь</h2>
        <div className="space-y-3">
          {recent.slice(0, 6).map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-elevated/50">
              <div className="text-center w-14 shrink-0">
                <div className="text-xl font-extrabold tabular-nums">{p.year}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">релиз</div>
              </div>
              <img src={p.cover} alt="" className="size-12 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">{p.trackIds.length} треков</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
