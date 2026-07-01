import { useMemo, useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, ChevronUp, Shuffle, ListMusic } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";
import TrackRow from "./TrackRow";
import EditTrackModal from "./EditTrackModal";
import type { SortField, SortDirection } from "@/types/music";
import { cn } from "@/lib/utils";

export default function TracksList() {
  const tracks = useLibrary((s) => s.tracks);
  const reorderTracksById = useLibrary((s) => s.reorderTracksById);
  const player = usePlayer();
  const [sort, setSort] = useState<SortField>("default");
  const [dir, setDir] = useState<SortDirection>("desc");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) {
        setFilterOpen(false);
        setYearOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const sorted = useMemo(() => {
    let list = [...tracks];
    if (yearFilter) list = list.filter((t) => t.year === yearFilter);
    if (sort !== "default") {
      list.sort((a, b) => {
        let r = 0;
        if (sort === "date") r = a.addedAt - b.addedAt;
        else if (sort === "title") r = a.title.localeCompare(b.title);
        else if (sort === "artist") r = a.artist.localeCompare(b.artist);
        else if (sort === "year") r = a.year - b.year;
        return dir === "asc" ? r : -r;
      });
    }
    return list;
  }, [tracks, sort, dir, yearFilter]);

  const years = useMemo(
    () => Array.from(new Set(tracks.map((t) => t.year))).sort((a, b) => b - a),
    [tracks]
  );

  const canReorder = sort === "default" && !yearFilter;

  const playFrom = (idx: number) => player.loadQueue(sorted, idx);

  /**
   * Weighted random by rating:
   *  - rating 1 → excluded
   *  - rating 2..5 → weight (2..5)^1.2  (5★ appears often but not overwhelming)
   */
  const smartShuffle = () => {
    const pool = sorted.filter((t) => t.rating >= 2);
    if (!pool.length) return;
    const weights = pool.map((t) => Math.pow(t.rating, 1.2));
    const total = weights.reduce((s, w) => s + w, 0);
    const result: typeof pool = [];
    const usedIdx = new Set<number>();
    while (result.length < pool.length) {
      let r = Math.random() * total;
      for (let i = 0; i < pool.length; i++) {
        if (usedIdx.has(i)) continue;
        r -= weights[i];
        if (r <= 0) {
          usedIdx.add(i);
          result.push(pool[i]);
          break;
        }
      }
      // safety
      if (result.length === pool.length) break;
    }
    // fallback: fill remainder if any
    pool.forEach((t) => { if (!result.includes(t)) result.push(t); });
    player.loadQueue(result, 0);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={smartShuffle}
            className="text-xl font-bold hover:text-brand transition-colors flex items-center gap-2"
            title="Случайное воспроизведение (с приоритетом по звёздам)"
          >
            <ListMusic className="size-5 text-brand" />
            Треки
          </button>
          <button
            onClick={smartShuffle}
            className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors"
            title="Случайное воспроизведение"
          >
            <Shuffle className="size-4" />
          </button>
        </div>

        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-subtle text-xs flex items-center gap-1.5 font-medium"
          >
            <Filter className="size-3.5" />
            {labelOf(sort)}
            {dir === "asc" ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-panel border border-border rounded-xl shadow-2xl z-30 p-1 animate-scale-in">
              <SortItem label="По умолчанию" active={sort === "default"} onClick={() => { setSort("default"); setFilterOpen(false); }} />
              <SortItem label="По дате добавления" active={sort === "date"} onClick={() => { setSort("date"); setFilterOpen(false); }} />
              <SortItem label="По названию" active={sort === "title"} onClick={() => { setSort("title"); setFilterOpen(false); }} />
              <SortItem label="По исполнителю" active={sort === "artist"} onClick={() => { setSort("artist"); setFilterOpen(false); }} />
              <div
                className="relative"
                onMouseEnter={() => setYearOpen(true)}
                onMouseLeave={() => setYearOpen(false)}
              >
                <SortItem
                  label={yearFilter ? `По году: ${yearFilter}` : "По году"}
                  active={sort === "year"}
                  onClick={() => { setSort("year"); }}
                  hasArrow
                />
                {yearOpen && (
                  <div className="absolute right-full top-0 mr-1 w-32 bg-panel border border-border rounded-xl shadow-2xl p-1 max-h-60 overflow-auto">
                    <button
                      onClick={() => { setYearFilter(null); }}
                      className={cn("w-full px-3 py-1.5 rounded-lg text-left text-sm hover:bg-elevated", !yearFilter && "bg-elevated")}
                    >Все</button>
                    {years.map((y) => (
                      <button
                        key={y}
                        onClick={() => { setYearFilter(y); setSort("year"); }}
                        className={cn("w-full px-3 py-1.5 rounded-lg text-left text-sm hover:bg-elevated tabular-nums", yearFilter === y && "bg-elevated")}
                      >{y}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-border/60 my-1" />
              <div className="grid grid-cols-2 gap-1 p-1">
                <button
                  onClick={() => setDir("asc")}
                  className={cn("px-2 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1", dir === "asc" ? "bg-brand/15 text-brand" : "hover:bg-elevated")}
                >
                  <ChevronUp className="size-3.5" /> Возр.
                </button>
                <button
                  onClick={() => setDir("desc")}
                  className={cn("px-2 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1", dir === "desc" ? "bg-brand/15 text-brand" : "hover:bg-elevated")}
                >
                  <ChevronDown className="size-3.5" /> Убыв.
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-panel rounded-2xl border border-border/50 p-2">
        {sorted.map((t, i) => (
          <TrackRow
            key={t.id + "-" + i}
            track={t}
            index={i}
            isPlaying={player.current?.id === t.id}
            canReorder={canReorder}
            onPlay={() => playFrom(i)}
            onEdit={() => setEditId(t.id)}
            onReorderDrop={(fromId) => reorderTracksById(fromId, t.id)}
          />
        ))}
      </div>

      <EditTrackModal trackId={editId} onClose={() => setEditId(null)} />
    </section>
  );
}

function labelOf(s: SortField) {
  return s === "default" ? "По умолчанию"
    : s === "date" ? "По дате"
    : s === "title" ? "По названию"
    : s === "artist" ? "По автору"
    : "По году";
}

function SortItem({ label, active, onClick, hasArrow }: { label: string; active?: boolean; onClick: () => void; hasArrow?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between transition-colors",
        active ? "bg-brand/15 text-brand" : "hover:bg-elevated"
      )}
    >
      <span>{label}</span>
      {hasArrow && <ChevronDown className="size-3.5 -rotate-90" />}
    </button>
  );
}
