import { ReactNode, useEffect, useRef } from "react";
import PlayerBar from "./PlayerBar";
import TopNav from "./TopNav";
import Footer from "./Footer";
import LyricsModal from "@/components/features/LyricsModal";
import EditModePanel from "@/components/features/EditModePanel";
import { usePlayer } from "@/stores/playerStore";
import { useLibrary } from "@/stores/libraryStore";
import { useEditMode } from "@/stores/editModeStore";

export default function MainLayout({ children }: { children: ReactNode }) {
  const tick = usePlayer((s) => s.tick);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const incrementPlayCount = useLibrary((s) => s.incrementPlayCount);
  const last = useRef<number>(0);

  const isEditing = useEditMode((s) => s.isEditing);
  const bgColor = useEditMode((s) => s.isEditing ? s.draftBackgroundColor : s.backgroundColor);
  const bgImage = useEditMode((s) => s.isEditing ? s.draftBackgroundImage : s.backgroundImage);
  const interactive = useEditMode((s) => s.isEditing ? s.draftInteractive : s.interactiveBackground);
  const currentCover = usePlayer((s) => s.current?.cover);

  useEffect(() => {
    let raf: number;
    const loop = (now: number) => {
      if (last.current === 0) last.current = now;
      const delta = (now - last.current) / 1000;
      last.current = now;
      if (isPlaying) tick(delta, incrementPlayCount);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, tick, incrementPlayCount]);

  const bgStyle: React.CSSProperties = {
    background: bgColor,
  };
  if (bgImage && !interactive) {
    bgStyle.backgroundImage = `url(${bgImage})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
    bgStyle.backgroundAttachment = "fixed";
  }

  return (
    <div className="min-h-screen text-foreground relative">
      {/* base background */}
      <div className="fixed inset-0 -z-10" style={bgStyle} />
      {/* interactive gradient */}
      {interactive && currentCover && (
        <div className="fixed inset-0 -z-10 opacity-60">
          <img src={currentCover} alt="" className="size-full object-cover blur-3xl scale-125" />
          <div className="absolute inset-0 bg-background/60" />
        </div>
      )}
      {/* edit-mode grid overlay */}
      {isEditing && (
        <div
          className="fixed inset-0 -z-[5] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--brand) / 0.14) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--brand) / 0.14) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      )}

      <PlayerBar />
      <TopNav />
      <div className="mx-auto max-w-[1280px] px-6 pt-6 pb-24">
        <div className="space-y-10">
          {children}
          <Footer />
        </div>
      </div>
      <LyricsModal />
      {isEditing && <EditModePanel />}
    </div>
  );
}
