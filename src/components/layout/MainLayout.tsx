import { ReactNode, useEffect, useRef } from "react";
import PlayerBar from "./PlayerBar";
import TopNav from "./TopNav";
import Footer from "./Footer";
import LyricsModal from "@/components/features/LyricsModal";
import { usePlayer } from "@/stores/playerStore";

export default function MainLayout({ children }: { children: ReactNode }) {
  const tick = usePlayer((s) => s.tick);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const last = useRef<number>(0);

  useEffect(() => {
    let raf: number;
    const loop = (now: number) => {
      if (last.current === 0) last.current = now;
      const delta = (now - last.current) / 1000;
      last.current = now;
      if (isPlaying) tick(delta);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, tick]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PlayerBar />
      <TopNav />
      <div className="mx-auto max-w-[1280px] px-6 pt-6 pb-24">
        <div className="space-y-10">
          {children}
          <Footer />
        </div>
      </div>
      <LyricsModal />
    </div>
  );
}
