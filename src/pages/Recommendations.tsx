import { Sparkles, Star, TrendingUp, Heart } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";
import { formatTime } from "@/lib/utils";

export default function Recommendations() {
  const tracks = useLibrary((s) => s.tracks).filter((t) => t.inRecommendations);
  const top = [...tracks].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const fresh = [...tracks].sort((a, b) => b.year - a.year).slice(0, 8);
  const loadQueue = usePlayer((s) => s.loadQueue);

  return (
    <div className="space-y-8">
      <header className="bg-gradient-to-br from-brand/30 via-purple-500/15 to-transparent rounded-2xl p-6 border border-brand/20">
        <div className="flex items-center gap-2 text-brand mb-2">
          <Sparkles className="size-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Рекомендации</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Подобрано для вас</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Подборка обновляется на основе ваших оценок, тегов и привычек прослушивания.
        </p>
        <button
          onClick={() => loadQueue(top, 0)}
          className="mt-4 px-5 py-2 rounded-full bg-brand hover:bg-brand/90 text-white text-sm font-semibold"
        >
          Запустить волну
        </button>
      </header>

      <Section title="По вашим оценкам" Icon={Star}>
        <Grid tracks={top} onPlay={(i) => loadQueue(top, i)} />
      </Section>

      <Section title="Новые релизы для вас" Icon={TrendingUp}>
        <Grid tracks={fresh} onPlay={(i) => loadQueue(fresh, i)} />
      </Section>

      <Section title="Похоже на ваш вайб" Icon={Heart}>
        <Grid tracks={tracks.slice(8, 16)} onPlay={(i) => loadQueue(tracks.slice(8, 16), i)} />
      </Section>
    </div>
  );
}

function Section({ title, Icon, children }: { title: string; Icon: any; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Icon className="size-4 text-brand" /> {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ tracks, onPlay }: { tracks: any[]; onPlay: (i: number) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tracks.map((t, i) => (
        <button
          key={t.id + i}
          onClick={() => onPlay(i)}
          className="group bg-panel hover:bg-elevated rounded-xl p-3 text-left transition-colors border border-border/40"
        >
          <div className="aspect-square rounded-lg overflow-hidden mb-2 relative">
            <img src={t.cover} alt="" className="size-full object-cover group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-sm font-semibold truncate">{t.title}</div>
          <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
          <div className="text-[11px] text-muted-foreground/70 mt-1">{formatTime(t.duration)}</div>
        </button>
      ))}
    </div>
  );
}
