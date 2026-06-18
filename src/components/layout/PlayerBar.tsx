import { useEffect, useRef, useState } from "react";
import {
  SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, Repeat1,
  Send, Radio as RadioIcon, Volume2, Volume1, VolumeX, Type, Plus, Music2,
} from "lucide-react";
import { usePlayer } from "@/stores/playerStore";
import { useLibrary } from "@/stores/libraryStore";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";

function IconBtn({
  active, onClick, onContextMenu, title, children, className,
}: {
  active?: boolean; onClick?: (e: React.MouseEvent) => void; onContextMenu?: (e: React.MouseEvent) => void;
  title?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "transition-colors duration-150 flex items-center justify-center",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground/90",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function PlayerBar() {
  const p = usePlayer();
  const lib = useLibrary();
  const trackBarRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  const t = p.current;
  const progressPct = t ? (p.progress / t.duration) * 100 : 0;
  const addedCount = t ? t.addedCount : 0;

  const handleSeek = (e: React.MouseEvent) => {
    if (!trackBarRef.current || !t) return;
    const r = trackBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    p.seek(pct * t.duration);
  };

  const handleVol = (e: React.MouseEvent) => {
    if (!volRef.current) return;
    const r = volRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    p.setVolume(pct);
  };

  useEffect(() => {
    const el = volRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      p.setVolume(p.volume + (e.deltaY < 0 ? 0.05 : -0.05));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [p]);

  const VolIcon = p.volume === 0 ? VolumeX : p.volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-[1480px] glass-blur bg-panel/85 border border-border/60 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="px-5 py-3 grid grid-cols-[auto_auto_auto_auto_auto_auto_1fr_auto] items-center gap-4">
          {/* prev */}
          <IconBtn title="Назад" onClick={p.prev} className="hover:scale-105">
            <SkipBack className="size-5" fill="currentColor" />
          </IconBtn>

          {/* play/pause */}
          <button
            onClick={() => (p.current ? (p.isPlaying ? p.pause() : p.play()) : null)}
            className={cn(
              "size-11 rounded-full flex items-center justify-center transition-all",
              "bg-foreground text-background hover:scale-[1.04] active:scale-95",
              !p.current && "opacity-50 cursor-not-allowed"
            )}
            title={p.isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {p.isPlaying
              ? <Pause className="size-5" fill="currentColor" />
              : <Play className="size-5 ml-0.5" fill="currentColor" />}
          </button>

          {/* next */}
          <IconBtn title="Вперёд" onClick={p.next} className="hover:scale-105">
            <SkipForward className="size-5" fill="currentColor" />
          </IconBtn>

          {/* shuffle */}
          <IconBtn title="Случайно" active={p.shuffle} onClick={p.toggleShuffle}>
            <Shuffle className={cn("size-[18px]", p.shuffle && "text-brand")} />
          </IconBtn>

          {/* repeat */}
          <IconBtn
            title={p.repeat === "off" ? "Повтор" : p.repeat === "playlist" ? "Повтор плейлиста" : "Повтор трека"}
            active={p.repeat !== "off"}
            onClick={p.cycleRepeat}
          >
            {p.repeat === "one"
              ? <Repeat1 className="size-[18px] text-brand" />
              : <Repeat className={cn("size-[18px]", p.repeat === "playlist" && "text-brand")} />}
          </IconBtn>

          {/* cover */}
          <div className="size-12 rounded-md overflow-hidden bg-elevated flex items-center justify-center">
            {t ? (
              <img src={t.cover} alt="" className="size-full object-cover" />
            ) : (
              <Music2 className="size-5 text-muted-foreground" />
            )}
          </div>

          {/* track info + progress */}
          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {/* lyrics */}
                <IconBtn title="Текст" active={p.showLyrics} onClick={p.toggleLyrics}>
                  <Type className={cn("size-4", p.showLyrics && "text-brand")} />
                </IconBtn>
                {/* add to library */}
                <button
                  onClick={() => t && lib.addTrackAgain(t.id)}
                  className="flex items-center gap-1 group"
                  title="Добавить в библиотеку"
                >
                  <Plus className={cn(
                    "size-4 transition-colors",
                    addedCount > 0 ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                  )} />
                  <span className={cn(
                    "text-xs tabular-nums",
                    addedCount > 0 ? "text-foreground" : "text-muted-foreground"
                  )}>×{addedCount}</span>
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold truncate text-foreground">
                  {t?.title ?? "Нет трека"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {t?.artist ?? "—"}
                </div>
              </div>
              <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                {t ? `${formatTime(p.progress)} / ${formatTime(t.duration)}` : "0:00 / 0:00"}
              </div>
            </div>

            {/* progress bar */}
            <div
              ref={trackBarRef}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHoverPct(((e.clientX - r.left) / r.width) * 100);
              }}
              onMouseLeave={() => setHoverPct(null)}
              onClick={handleSeek}
              className="relative h-1.5 bg-subtle rounded-full cursor-pointer group"
            >
              <div
                className="absolute inset-y-0 left-0 bg-foreground/85 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
              {hoverPct !== null && (
                <div
                  className="absolute inset-y-0 left-0 bg-foreground/20 rounded-full pointer-events-none"
                  style={{ width: `${hoverPct}%` }}
                />
              )}
              <div
                className="absolute -top-1 size-3.5 rounded-full bg-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPct}% - 7px)` }}
              />
            </div>
          </div>

          {/* right cluster */}
          <div className="flex items-center gap-3 pl-2">
            {/* forward (later) */}
            <IconBtn
              title="Послушать позже"
              active={t ? lib.laterListIds.includes(t.id) : false}
              onClick={() => {
                if (!t) return;
                lib.setLater(t.id);
                toast.success(lib.laterListIds.includes(t.id) ? "Удалено из «Позже»" : "Добавлено в «Послушать позже»");
              }}
            >
              <Send className={cn("size-[18px]", t && lib.laterListIds.includes(t.id) && "text-brand")} />
            </IconBtn>

            {/* broadcast to profile */}
            <IconBtn title="Транслировать в профиль" active={p.broadcastToProfile} onClick={p.toggleBroadcast}>
              <RadioIcon className={cn("size-[18px]", p.broadcastToProfile && "text-brand")} />
            </IconBtn>

            {/* volume */}
            <div className="flex items-center gap-2">
              <VolIcon className="size-[18px] text-muted-foreground" />
              <div
                ref={volRef}
                onClick={handleVol}
                onMouseDown={(e) => {
                  const move = (ev: MouseEvent) => {
                    const r = volRef.current!.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
                    p.setVolume(pct);
                  };
                  const up = () => {
                    window.removeEventListener("mousemove", move);
                    window.removeEventListener("mouseup", up);
                  };
                  window.addEventListener("mousemove", move);
                  window.addEventListener("mouseup", up);
                }}
                className="relative w-24 h-1.5 bg-subtle rounded-full cursor-pointer"
              >
                <div className="absolute inset-y-0 left-0 bg-foreground/80 rounded-full"
                  style={{ width: `${p.volume * 100}%` }} />
              </div>
            </div>

            {/* speed */}
            <button
              onClick={() => p.bumpRate(+0.10)}
              onContextMenu={(e) => { e.preventDefault(); p.bumpRate(-0.10); }}
              className={cn(
                "px-2 py-1 rounded-md text-xs font-semibold tabular-nums transition-colors",
                p.playbackRate !== 1
                  ? "bg-brand/15 text-brand"
                  : "text-muted-foreground hover:text-foreground/90"
              )}
              title="ЛКМ +0.10, ПКМ -0.10"
            >
              ×{p.playbackRate.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
