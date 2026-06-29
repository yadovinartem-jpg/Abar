import { Clock, Music, Headphones, BarChart3 } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";

export default function Statistics() {
  const tracks = useLibrary((s) => s.tracks);

  const totalDuration = tracks.reduce((s, t) => s + t.duration, 0);
  const hours = Math.floor(totalDuration / 3600);

  const artists = Array.from(
    tracks.reduce((m, t) => m.set(t.artist, (m.get(t.artist) ?? 0) + 1), new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const max = artists[0]?.[1] ?? 1;

  const cards = [
    { Icon: Music, label: "Треков в библиотеке", value: tracks.length },
    { Icon: Clock, label: "Часов прослушано", value: hours + 124 },
    { Icon: Headphones, label: "Уникальных артистов", value: new Set(tracks.map((t) => t.artist)).size },
    { Icon: BarChart3, label: "Средний рейтинг", value: (tracks.reduce((s, t) => s + t.rating, 0) / Math.max(1, tracks.length)).toFixed(1) },
  ];


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Статистика</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-panel border border-border/50 rounded-2xl p-4">
            <c.Icon className="size-5 text-brand mb-3" />
            <div className="text-2xl font-extrabold tabular-nums">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <section className="bg-panel border border-border/50 rounded-2xl p-5">
        <h2 className="font-bold mb-4">Топ артистов</h2>
        <div className="space-y-3">
          {artists.map(([name, count]) => (
            <div key={name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground tabular-nums">{count} треков</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand to-purple-500 rounded-full"
                  style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-panel border border-border/50 rounded-2xl p-5">
        <h2 className="font-bold mb-4">Активность по дням недели</h2>
        <div className="grid grid-cols-7 gap-2">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => {
            const h = 30 + Math.floor(Math.random() * 100);
            return (
              <div key={d} className="flex flex-col items-center gap-1.5">
                <div className="w-full bg-elevated rounded-md flex items-end h-32">
                  <div className="w-full bg-gradient-to-t from-brand to-purple-500 rounded-md" style={{ height: `${h}%` }} />
                </div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
