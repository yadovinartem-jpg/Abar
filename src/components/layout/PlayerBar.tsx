import { useEffect, useRef, useState } from "react";
import {
  SkipBack, SkipForward, Play, Pause, Shuffle, Repeat, Repeat1,
  Clock, Radio as RadioIcon, Volume2, Volume1, VolumeX, Type, Music2,
  SlidersHorizontal,
} from "lucide-react";
import { usePlayer } from "@/stores/playerStore";
import { useLibrary } from "@/stores/libraryStore";
import { cn, formatTime } from "@/lib/utils";
import { toast } from "sonner";
import EqualizerModal from "@/components/features/EqualizerModal";

function IconBtn({
  active, onClick, onContextMenu, title, children, size = 40,
}: {
  active?: boolean; onClick?: (e: React.MouseEvent) => void; onContextMenu?: (e: React.MouseEvent) => void;
  title?: string; children: React.ReactNode; size?: number;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{ width: size, height: size }}
      className={cn(
        "shrink-0 rounded-lg grid place-items-center transition-colors duration-150 hover:bg-elevated/60",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground/90",
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
  const [eqOpen, setEqOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<null | { id: string; olderThanDay: boolean }>(null);
  const [volPopup, setVolPopup] = useState(false);
  const volPopupTimer = useRef<number | null>(null);

  const t = p.current;
  const progressPct = t ? (p.progress / t.duration) * 100 : 0;
  const addedCount = t ? (lib.tracks.find(x => x.id === t.id)?.addedCount ?? 0) : 0;

  // volume popup: show for 2s after volume change
  useEffect(() => {
    if (!p.volumePopupShownAt) return;
    setVolPopup(true);
    if (volPopupTimer.current) window.clearTimeout(volPopupTimer.current);
    volPopupTimer.current = window.setTimeout(() => setVolPopup(false), 1600);
    return () => {
      if (volPopupTimer.current) window.clearTimeout(volPopupTimer.current);
    };
  }, [p.volumePopupShownAt]);

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

  const handleAddClick = () => {
    if (!t) return;
    lib.addTrackAgain(t.id);
    lib.setHighlight(t.id);
    setTimeout(() => lib.setHighlight(null), 2000);
    toast.success("Копия добавлена в начало треклиста");
  };

  const handleAddContext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!t) return;
    const orig = lib.tracks.find(x => x.id === t.id);
    if (!orig || orig.addedCount === 0) return;
    const olderThanDay = Date.now() - orig.addedAt > 24 * 3600 * 1000;
    if (olderThanDay) {
      setConfirmRemove({ id: t.id, olderThanDay: true });
      return;
    }
    lib.removeTopCopy(t.id);
    lib.setHighlight(t.id);
    setTimeout(() => lib.setHighlight(null), 2000);
    toast.message("Одна копия удалена");
  };

  return (
    <div className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-[1480px] glass-blur bg-panel/85 border border-border/60 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <div className="px-4 py-3 flex items-center gap-2">
          {/* left cluster: transport */}
          <IconBtn title="Назад" onClick={p.prev} size={40}>
            <SkipBack className="size-5" fill="currentColor" />
          </IconBtn>

          <button
            onClick={() => (p.current ? (p.isPlaying ? p.pause() : p.play()) : null)}
            className={cn(
              "size-11 shrink-0 rounded-full flex items-center justify-center transition-all",
              "bg-foreground text-background hover:scale-[1.04] active:scale-95",
              !p.current && "opacity-50 cursor-not-allowed"
            )}
            title={p.isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {p.isPlaying
              ? <Pause className="size-5" fill="currentColor" />
              : <Play className="size-5 ml-0.5" fill="currentColor" />}
          </button>

          <IconBtn title="Вперёд" onClick={p.next} size={40}>
            <SkipForward className="size-5" fill="currentColor" />
          </IconBtn>

          <IconBtn title="Случайно" active={p.shuffle} onClick={p.toggleShuffle} size={40}>
            <Shuffle className={cn("size-[18px]", p.shuffle && "text-brand")} />
          </IconBtn>

          <IconBtn
            title={p.repeat === "off" ? "Повтор" : p.repeat === "playlist" ? "Повтор плейлиста" : "Повтор трека"}
            active={p.repeat !== "off"}
            onClick={p.cycleRepeat}
            size={40}
          >
            {p.repeat === "one"
              ? <Repeat1 className="size-[18px] text-brand" />
              : <Repeat className={cn("size-[18px]", p.repeat === "playlist" && "text-brand")} />}
          </IconBtn>

          {/* cover */}
          <div className="size-12 shrink-0 ml-1 rounded-md overflow-hidden bg-elevated flex items-center justify-center">
            {t ? (
              <img src={t.cover} alt="" className="size-full object-cover" />
            ) : (
              <Music2 className="size-5 text-muted-foreground" />
            )}
          </div>

          {/* track info + progress bar (flex-1) */}
          <div className="flex-1 min-w-0 flex flex-col gap-1 px-2">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold truncate text-foreground leading-tight">
                {t?.title ?? "Нет трека"}
              </div>
              <div className="text-[13px] text-muted-foreground truncate leading-tight">
                {t?.artist ?? "—"}
              </div>
            </div>
            <div
              ref={trackBarRef}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setHoverPct(((e.clientX - r.left) / r.width) * 100);
              }}
              onMouseLeave={() => setHoverPct(null)}
              onClick={handleSeek}
              className="relative h-2 bg-subtle rounded-full cursor-pointer group"
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
              {/* time overlay */}
              <div className="pointer-events-none absolute -top-4 right-0 text-[10px] text-muted-foreground tabular-nums">
                {t
                  ? (p.isPlaying ? formatTime(p.progress) : formatTime(t.duration))
                  : "0:00"}
              </div>
            </div>
          </div>

          {/* right cluster */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Equalizer */}
            <div className="relative">
              <IconBtn title="Эквалайзер" active={eqOpen} onClick={() => setEqOpen(o => !o)} size={40}>
                <SlidersHorizontal className={cn("size-[18px]", eqOpen && "text-brand")} />
              </IconBtn>
              {eqOpen && <EqualizerModal onClose={() => setEqOpen(false)} />}
            </div>

            {/* Later playlist (clock) */}
            <IconBtn
              title="Послушать позже"
              active={t ? lib.laterListIds.includes(t.id) : false}
              onClick={() => {
                if (!t) return;
                lib.setLater(t.id);
                toast.success(lib.laterListIds.includes(t.id) ? "Удалено из «Позже»" : "Добавлено в «Послушать позже»");
              }}
              size={40}
            >
              <Clock className={cn("size-[18px]", t && lib.laterListIds.includes(t.id) && "text-brand")} />
            </IconBtn>

            {/* Broadcast to profile - bigger */}
            <IconBtn title="Транслировать в профиль" active={p.broadcastToProfile} onClick={p.toggleBroadcast} size={44}>
              <RadioIcon className={cn("size-[22px]", p.broadcastToProfile && "text-brand")} />
            </IconBtn>

            {/* Volume + popup */}
            <div className="flex items-center gap-2 px-1 relative">
              <VolIcon className="size-[18px] text-muted-foreground shrink-0" />
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
                {volPopup && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-panel border border-border rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums shadow-lg animate-fade-in">
                    {Math.round(p.volume * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Lyrics (Тт) */}
            <IconBtn title="Текст" active={p.showLyrics} onClick={p.toggleLyrics} size={40}>
              <span className={cn(
                "font-bold text-[15px] leading-none tracking-tight",
                p.showLyrics && "text-brand"
              )}>Тт</span>
            </IconBtn>

            {/* Add counter (+N) */}
            <button
              onClick={handleAddClick}
              onContextMenu={handleAddContext}
              className={cn(
                "shrink-0 px-2.5 h-10 min-w-[44px] rounded-lg text-[13px] font-semibold tabular-nums transition-colors hover:bg-elevated/60",
                addedCount > 0 ? "text-foreground" : "text-muted-foreground"
              )}
              title="ЛКМ +1 копия, ПКМ -1"
            >
              +{addedCount}
            </button>

            {/* Speed */}
            <button
              onClick={() => p.bumpRate(+0.10)}
              onContextMenu={(e) => { e.preventDefault(); p.bumpRate(-0.10); }}
              className={cn(
                "shrink-0 px-2.5 h-10 rounded-lg text-[12px] font-semibold tabular-nums transition-colors hover:bg-elevated/60",
                p.playbackRate !== 1
                  ? "text-brand"
                  : "text-muted-foreground"
              )}
              title="ЛКМ +0.10, ПКМ -0.10"
            >
              ×{p.playbackRate.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm removal for tracks older than a day */}
      {confirmRemove && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm grid place-items-center"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            className="bg-panel border border-border rounded-2xl p-6 max-w-sm w-[92%] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-bold mb-1">Удалить копию трека?</div>
            <div className="text-sm text-muted-foreground mb-5">
              Трек был добавлен более суток назад. Он подсветится в основном треклисте.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmRemove(null)}
                className="px-4 py-2 rounded-lg bg-elevated hover:bg-subtle text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  lib.removeTopCopy(confirmRemove.id);
                  lib.setHighlight(confirmRemove.id);
                  setTimeout(() => lib.setHighlight(null), 3000);
                  toast.success("Копия удалена");
                  setConfirmRemove(null);
                }}
                className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
