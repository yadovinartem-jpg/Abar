import { useState, useRef, useEffect } from "react";
import { MoreVertical, Plus, Star, Pencil, RotateCcw, Tag as TagIcon, Trash2, EyeOff, Sparkles } from "lucide-react";
import type { Track } from "@/types/music";
import { cn, formatTime } from "@/lib/utils";
import { usePlayer } from "@/stores/playerStore";
import { useLibrary } from "@/stores/libraryStore";
import { toast } from "sonner";

interface Props {
  track: Track;
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onTags: () => void;
}

export default function TrackRow({ track, index, isPlaying, onPlay, onEdit, onTags }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lib = useLibrary();
  const progress = usePlayer((s) => s.progress);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div
      onDoubleClick={onPlay}
      className={cn(
        "group grid grid-cols-[40px_56px_1fr_auto_auto_auto_36px] items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isPlaying ? "bg-brand/12" : "hover:bg-elevated/60"
      )}
    >
      <div className={cn("text-xs tabular-nums text-center", isPlaying ? "text-brand font-semibold" : "text-muted-foreground")}>
        {index + 1}
      </div>

      <button onClick={onPlay} className="size-12 rounded-md overflow-hidden bg-elevated relative">
        <img src={track.cover} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 grid place-items-center transition-opacity">
          <span className="text-white text-xs font-bold">▶</span>
        </div>
      </button>

      <div className="min-w-0">
        <div className={cn("text-sm font-semibold truncate", isPlaying ? "text-brand" : "text-foreground")}>{track.title}</div>
        <div className="text-xs text-muted-foreground truncate">{track.artist} · {track.year}</div>
      </div>

      {/* tags */}
      <div className="hidden md:flex items-center gap-1.5 max-w-[260px] overflow-hidden">
        {track.tags.filter((t) => t.visible).slice(0, 4).map((t) => (
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
      <div className="hidden lg:flex flex-col items-center text-muted-foreground min-w-[28px]">
        {track.globalAddedCount > 0 && (
          <>
            <div className="text-[11px] tabular-nums leading-tight">{track.globalAddedCount}</div>
            <Plus className="size-3" />
          </>
        )}
      </div>

      {/* duration / progress */}
      <div className={cn("text-xs tabular-nums w-12 text-right", isPlaying ? "text-brand" : "text-muted-foreground")}>
        {isPlaying ? formatTime(progress) : formatTime(track.duration)}
      </div>

      {/* menu */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-foreground hover:bg-elevated"
        >
          <MoreVertical className="size-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-panel border border-border rounded-xl shadow-2xl z-30 p-1 animate-scale-in">
            <Item Icon={Pencil} label="Редактировать" onClick={() => { onEdit(); setMenuOpen(false); }} />
            <Item Icon={RotateCcw} label="Добавить трек ещё раз" onClick={() => { lib.addTrackAgain(track.id); toast.success("Добавлено заново"); setMenuOpen(false); }} />
            <Item Icon={TagIcon} label="Теги" onClick={() => { onTags(); setMenuOpen(false); }} />
            <Item
              Icon={Star}
              label={`Рейтинг: ${"★".repeat(track.rating)}${"☆".repeat(5 - track.rating)}`}
              onClick={() => {
                const next = (track.rating % 5) + 1;
                lib.updateTrack(track.id, { rating: next });
                toast.message(`Установлен рейтинг ${next}`);
                setMenuOpen(false);
              }}
            />
            <Item
              Icon={Sparkles}
              label={track.inRecommendations ? "Убрать из рекомендаций" : "В рекомендации"}
              onClick={() => { lib.updateTrack(track.id, { inRecommendations: !track.inRecommendations }); setMenuOpen(false); }}
            />
            <Item
              Icon={EyeOff}
              label={track.isPrivate ? "Сделать публичным" : "Приватный режим"}
              onClick={() => { lib.updateTrack(track.id, { isPrivate: !track.isPrivate }); setMenuOpen(false); }}
            />
            <div className="border-t border-border/60 my-1" />
            <Item Icon={Trash2} label="Удалить из библиотеки" danger onClick={() => { lib.removeTrack(track.id, false); toast.message("Удалено из библиотеки"); setMenuOpen(false); }} />
            <Item Icon={Trash2} label="Удалить с площадки" danger onClick={() => { lib.removeTrack(track.id, true); toast.error("Удалено с площадки"); setMenuOpen(false); }} />
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ Icon, label, onClick, danger }: { Icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-2.5 transition-colors",
        danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-elevated"
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
}
