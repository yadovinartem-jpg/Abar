import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, ChevronRight as ArrowRight } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";
import Modal from "./Modal";
import PlaylistDetailModal from "./PlaylistDetailModal";
import type { Playlist } from "@/types/music";

export default function Playlists() {
  const playlists = useLibrary((s) => s.playlists);
  const tracks = useLibrary((s) => s.tracks);
  const reorder = useLibrary((s) => s.reorderPlaylists);
  const loadQueue = usePlayer((s) => s.loadQueue);
  const scroller = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState<Playlist | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  const playPlaylist = (pl: Playlist) => {
    const list = pl.trackIds.map((id) => tracks.find((t) => t.id === id)!).filter(Boolean);
    if (list.length) loadQueue(list, 0);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowAll(true)}
          className="group flex items-center gap-2 hover:text-brand transition-colors"
        >
          <h2 className="text-xl font-bold">Плейлисты</h2>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollBy(-1)}
            className="size-8 rounded-full bg-elevated hover:bg-subtle grid place-items-center"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="size-8 rounded-full bg-elevated hover:bg-subtle grid place-items-center"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="overflow-x-auto scroll-smooth">
        <div className="flex gap-4 min-w-max pb-2">
          {playlists.map((pl) => (
            <div key={pl.id} className="w-[170px]">
              <button
                onClick={() => setDetail(pl)}
                className="group block w-full text-left"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-elevated">
                  <img
                    src={pl.cover}
                    alt=""
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPlaylist(pl);
                    }}
                    className="absolute bottom-2 right-2 size-10 rounded-full bg-brand grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-brand/30 hover:scale-105"
                  >
                    <Play className="size-5 text-white ml-0.5" fill="white" />
                  </button>
                </div>
                <div className="mt-2 text-sm font-semibold truncate">{pl.title}</div>
                <div className="text-xs text-muted-foreground truncate">{pl.artist}</div>
                <div className="text-xs text-muted-foreground">{pl.year}</div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Все плейлисты" className="max-w-5xl">
        <div className="grid grid-cols-5 gap-4">
          {playlists.map((pl, i) => (
            <div
              key={pl.id}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null && dragFrom !== i) reorder(dragFrom, i);
                setDragFrom(null);
              }}
              onClick={() => setDetail(pl)}
              className="cursor-pointer active:cursor-grabbing group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-elevated">
                <img
                  src={pl.cover}
                  alt=""
                  className="size-full object-cover transition-transform group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-2 text-sm font-semibold truncate">{pl.title}</div>
              <div className="text-xs text-muted-foreground truncate">{pl.artist}</div>
              <div className="text-xs text-muted-foreground">{pl.year}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-muted-foreground/70">
          Перетащите плейлист для изменения порядка. Кликните, чтобы открыть.
        </div>
      </Modal>

      <PlaylistDetailModal playlist={detail} onClose={() => setDetail(null)} />
    </section>
  );
}
