import { useState, useRef, useEffect } from "react";
import {
  MoreVertical, Plus, Star, Pencil, RotateCcw, Tag as TagIcon,
  Trash2, EyeOff, ChevronRight, Music,
} from "lucide-react";
import type { Track } from "@/types/music";
import { cn, formatTime } from "@/lib/utils";
import { usePlayer } from "@/stores/playerStore";
import { useLibrary } from "@/stores/libraryStore";
import { toast } from "sonner";
import TagPopover from "./TagPopover";

interface Props {
  track: Track;
  index: number;
  isPlaying: boolean;
  canReorder?: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onReorderDrop?: (fromId: string) => void;
}

export default function TrackRow({
  track, index, isPlaying, canReorder, onPlay, onEdit, onReorderDrop,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const lib = useLibrary();
  const progress = usePlayer((s) => s.progress);
  const highlightId = useLibrary((s) => s.highlightTrackId);
  const isHighlighted = highlightId === track.id;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setRatingOpen(false);
        setTagsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // scroll into view on highlight
  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={rowRef}
      onDoubleClick={onPlay}
      onDragOver={canReorder ? (e) => e.preventDefault() : undefined}
      onDrop={canReorder ? (e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData("text/plain");
        if (from && from !== track.id) onReorderDrop?.(from);
      } : undefined}
      className={cn(
        "group grid grid-cols-[52px_56px_1fr_auto_44px_50px_52px_36px_18px] items-center gap-2.5 px-3 py-2 rounded-lg transition-colors",
        isPlaying ? "bg-brand/12" : "hover:bg-elevated/60",
        isHighlighted && "ring-2 ring-brand/70 bg-brand/15"
      )}
    >
      <div
        draggable={canReorder}
        onDragStart={canReorder ? (e) => { e.dataTransfer.setData("text/plain", track.id); } : undefined}
        className={cn(
          "text-base font-semibold tabular-nums text-center select-none size-11 grid place-items-center rounded-md",
          canReorder && "cursor-grab active:cursor-grabbing hover:bg-elevated/60",
          isPlaying ? "text-brand" : "text-muted-foreground"
        )}
        title={canReorder ? "Перетащите для смены позиции" : undefined}
      >
        {index + 1}
      </div>

      <button onClick={onPlay} className="size-12 rounded-md overflow-hidden bg-elevated relative">
        <img src={track.cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 grid place-items-center transition-opacity">
          <span className="text-white text-xs font-bold">▶</span>
        </div>
      </button>

      <div className="min-w-0">
        <div className={cn("text-sm font-semibold truncate", isPlaying ? "text-brand" : "text-foreground")}>
          {track.title}
        </div>
        <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
      </div>

      {/* tags */}
      <div className="hidden md:flex items-center gap-1.5 max-w-[220px] overflow-hidden">
        {track.tags.slice(0, 4).map((t) => (
          <span
            key={t.id}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap"
            style={{ backgroundColor: `${t.color}22`, color: t.color }}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* global add count */}
      <div className="hidden lg:flex items-center gap-1 text-muted-foreground justify-end">
        {track.globalAddedCount > 0 ? (
          <>
            <Plus className="size-3" />
            <span className="text-[11px] tabular-nums">{track.globalAddedCount}</span>
          </>
        ) : (
          <span className="text-[11px] tabular-nums opacity-30">0</span>
        )}
      </div>

      {/* play count */}
      <div className="hidden lg:flex items-center gap-1 text-muted-foreground justify-end">
        <Music className="size-3" />
        <span className="text-[11px] tabular-nums">{track.playCount}</span>
      </div>

      {/* duration / progress */}
      <div className={cn("text-xs tabular-nums w-12 text-right", isPlaying ? "text-brand" : "text-muted-foreground")}>
        {isPlaying ? formatTime(progress) : formatTime(track.duration)}
      </div>

      {/* menu */}
      <div ref={ref} className="relative">
        <button
          onClick={() => { setMenuOpen((o) => !o); setRatingOpen(false); setTagsOpen(false); }}
          className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-foreground hover:bg-elevated"
        >
          <MoreVertical className="size-4" />
        </button>
        {menuOpen && !tagsOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-panel border border-border rounded-xl shadow-2xl z-30 p-1 animate-scale-in">
            <Item Icon={Pencil} label="Редактировать" onClick={() => { onEdit(); setMenuOpen(false); }} />
            <Item
              Icon={RotateCcw}
              label="Добавить трек ещё раз"
              onClick={() => {
                lib.addTrackAgain(track.id);
                toast.success("Копия добавлена в начало");
                setMenuOpen(false);
              }}
            />
            <Item
              Icon={TagIcon}
              label="Теги"
              hasArrow
              onClick={() => setTagsOpen(true)}
            />

            <div className="relative">
              <Item
                Icon={Star}
                label="Рейтинг"
                hasArrow
                active={ratingOpen}
                onClick={() => setRatingOpen((o) => !o)}
              />
              {ratingOpen && (
                <div className="absolute right-full top-0 mr-1 bg-panel rounded-xl p-2 border border-border shadow-2xl">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          lib.updateTrack(track.id, { rating: n });
                          toast.success(`Рейтинг: ${n}`);
                          setRatingOpen(false);
                          setMenuOpen(false);
                        }}
                        className="size-7 grid place-items-center hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "size-4 transition-colors",
                            n <= track.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Item
              Icon={EyeOff}
              label={track.isPrivate ? "Сделать публичным" : "Приватный режим"}
              onClick={() => {
                lib.updateTrack(track.id, { isPrivate: !track.isPrivate });
                setMenuOpen(false);
              }}
            />
            <div className="border-t border-border/60 my-1" />
            <Item
              Icon={Trash2}
              label="Удалить из библиотеки"
              danger
              onClick={() => {
                lib.removeTrack(track.id, false);
                toast.message("Удалено из библиотеки");
                setMenuOpen(false);
              }}
            />
            <Item
              Icon={Trash2}
              label="Удалить с площадки"
              danger
              onClick={() => {
                lib.removeTrack(track.id, true);
                toast.error("Удалено с площадки");
                setMenuOpen(false);
              }}
            />
          </div>
        )}
        {tagsOpen && (
          <TagPopover trackId={track.id} onClose={() => { setTagsOpen(false); setMenuOpen(false); }} />
        )}
      </div>

      {/* privacy indicator */}
      <div className="grid place-items-center">
        {track.isPrivate && (
          <EyeOff className="size-3.5 text-muted-foreground" strokeWidth={2} />
        )}
      </div>
    </div>
  );
}

function Item({
  Icon, label, onClick, danger, hasArrow, active,
}: {
  Icon: any; label: string; onClick: () => void; danger?: boolean; hasArrow?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-2.5 transition-colors",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : active
          ? "bg-elevated text-foreground"
          : "hover:bg-elevated"
      )}
    >
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {hasArrow && <ChevronRight className="size-3.5" />}
    </button>
  );
}
