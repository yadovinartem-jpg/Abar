import { useRef, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import Modal from "./Modal";
import PlaylistDetailModal from "./PlaylistDetailModal";
import type { Artist, Playlist } from "@/types/music";

export default function Artists() {
  const artists = useLibrary((s) => s.artists);
  const tracks = useLibrary((s) => s.tracks);
  const reorder = useLibrary((s) => s.reorderArtists);
  const scroller = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [openArtist, setOpenArtist] = useState<Artist | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const scrollBy = (d: 1 | -1) =>
    scroller.current?.scrollBy({ left: d * 480, behavior: "smooth" });

  // Build virtual playlist for the artist
  const artistPlaylist = useMemo<Playlist | null>(() => {
    if (!openArtist) return null;
    const artistTracks = tracks
      .filter((t) => t.artist.toLowerCase() === openArtist.name.toLowerCase())
      .sort((a, b) => b.addedAt - a.addedAt);
    return {
      id: `artist-pl-${openArtist.id}`,
      title: openArtist.name,
      artist: openArtist.name,
      year: artistTracks[0]?.year ?? new Date().getFullYear(),
      cover: openArtist.cover,
      trackIds: artistTracks.map((t) => t.id),
      listenCount: artistTracks.reduce((s, t) => s + (t.globalAddedCount ?? 0), 0),
    };
  }, [openArtist, tracks]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowAll(true)}
          className="group flex items-center gap-2 hover:text-brand transition-colors"
        >
          <h2 className="text-xl font-bold">Артисты</h2>
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
          {artists.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpenArtist(a)}
              className="w-[150px] text-center group"
            >
              <div className="aspect-square rounded-full overflow-hidden bg-elevated ring-1 ring-border/50">
                <img
                  src={a.cover}
                  alt=""
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="mt-2.5 text-[15px] font-semibold truncate">{a.name}</div>
            </button>
          ))}
        </div>
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Все артисты" className="max-w-5xl">
        <div className="grid grid-cols-5 gap-5">
          {artists.map((a, i) => (
            <div
              key={a.id}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null && dragFrom !== i) reorder(dragFrom, i);
                setDragFrom(null);
              }}
              onClick={() => { setOpenArtist(a); setShowAll(false); }}
              className="text-center cursor-pointer active:cursor-grabbing group"
            >
              <div className="aspect-square rounded-full overflow-hidden bg-elevated ring-1 ring-border/50">
                <img
                  src={a.cover}
                  alt=""
                  className="size-full object-cover transition-transform group-hover:scale-[1.05]"
                />
              </div>
              <div className="mt-2.5 text-[15px] font-semibold truncate">{a.name}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-muted-foreground/70">
          Перетащите артиста, чтобы изменить порядок. Кликните, чтобы открыть.
        </div>
      </Modal>

      <PlaylistDetailModal
        playlist={artistPlaylist}
        artistMode
        onClose={() => setOpenArtist(null)}
      />
    </section>
  );
}
