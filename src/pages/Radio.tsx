import { Radio as RadioIcon, Play } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";

const stations = [
  { key: "chill", name: "Chill вибрации", desc: "Расслабленный фон для работы", grad: "from-blue-500/40 to-cyan-400/30" },
  { key: "drive", name: "За рулём", desc: "Ритм для долгих дорог", grad: "from-orange-500/40 to-rose-400/30" },
  { key: "focus", name: "Глубокий фокус", desc: "Без вокала, для концентрации", grad: "from-emerald-500/40 to-teal-400/30" },
  { key: "night", name: "Ночь в городе", desc: "Меланхолия и неон", grad: "from-purple-600/40 to-pink-400/30" },
  { key: "party", name: "Вечеринка", desc: "Только бэнгеры", grad: "from-yellow-400/40 to-red-500/30" },
  { key: "indie", name: "Инди-ночь", desc: "Тёплый аналоговый звук", grad: "from-amber-500/40 to-stone-400/30" },
];

export default function Radio() {
  const tracks = useLibrary((s) => s.tracks);
  const loadQueue = usePlayer((s) => s.loadQueue);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <RadioIcon className="size-5 text-brand" /> Радио
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              const shuffled = [...tracks].sort(() => Math.random() - 0.5).slice(0, 20);
              loadQueue(shuffled, 0);
            }}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left bg-gradient-to-br ${s.grad} border border-border/40`}
          >
            <div className="absolute inset-0 bg-panel/40" />
            <div className="relative">
              <RadioIcon className="size-6 text-foreground/80 mb-12" />
              <div className="text-xl font-bold">{s.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
              <div className="mt-4 inline-flex items-center gap-1.5 size-10 rounded-full bg-foreground text-background grid place-items-center opacity-90 group-hover:scale-110 transition-transform">
                <Play className="size-4" fill="currentColor" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
