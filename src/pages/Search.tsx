import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";
import { formatTime } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";

export default function Search() {
  const [q, setQ] = useState("");
  const tracks = useLibrary((s) => s.tracks);
  const playlists = useLibrary((s) => s.playlists);
  const artists = useLibrary((s) => s.artists);
  const loadQueue = usePlayer((s) => s.loadQueue);

  const ql = q.trim().toLowerCase();
  const tFiltered = ql ? tracks.filter((t) => t.title.toLowerCase().includes(ql) || t.artist.toLowerCase().includes(ql)) : [];
  const plFiltered = ql ? playlists.filter((p) => p.title.toLowerCase().includes(ql)) : [];
  const aFiltered = ql ? artists.filter((a) => a.name.toLowerCase().includes(ql)) : [];

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-3">
        <Sidebar />
      </aside>
      <main className="col-span-12 lg:col-span-9 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <SearchIcon className="size-5 text-brand" /> Поиск
          </h1>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Трек, исполнитель, плейлист..."
              className="w-full bg-panel border border-border rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-brand/60"
            />
          </div>
        </div>

        {!q && (
          <div className="bg-panel rounded-2xl p-10 border border-border/50 text-center">
            <div className="text-lg font-semibold mb-1">Что хотите послушать?</div>
            <div className="text-sm text-muted-foreground">Начните вводить название трека, имя исполнителя или плейлист.</div>
          </div>
        )}

        {q && (
          <>
            {aFiltered.length > 0 && (
              <Section title="Исполнители">
                <div className="grid grid-cols-4 gap-4">
                  {aFiltered.map((a) => (
                    <div key={a.id} className="text-center">
                      <div className="aspect-square rounded-full overflow-hidden">
                        <img src={a.cover} alt="" className="size-full object-cover" />
                      </div>
                      <div className="mt-2 text-sm font-semibold truncate">{a.name}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {plFiltered.length > 0 && (
              <Section title="Плейлисты">
                <div className="grid grid-cols-4 gap-4">
                  {plFiltered.map((p) => (
                    <div key={p.id}>
                      <div className="aspect-square rounded-xl overflow-hidden">
                        <img src={p.cover} alt="" className="size-full object-cover" />
                      </div>
                      <div className="mt-2 text-sm font-semibold truncate">{p.title}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {tFiltered.length > 0 && (
              <Section title="Треки">
                <div className="bg-panel rounded-2xl border border-border/50 p-2">
                  {tFiltered.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => loadQueue(tFiltered, i)}
                      className="w-full grid grid-cols-[56px_1fr_auto] items-center gap-3 px-3 py-2 rounded-lg hover:bg-elevated/60 text-left"
                    >
                      <img src={t.cover} alt="" className="size-12 rounded-md object-cover" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">{formatTime(t.duration)}</div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {!aFiltered.length && !plFiltered.length && !tFiltered.length && (
              <div className="text-center py-16 text-muted-foreground">Ничего не найдено</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
