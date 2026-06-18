import { Check, Plug, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

const services = [
  { key: "spotify", name: "Spotify", connected: true, color: "#1ed760" },
  { key: "vk", name: "ВКонтакте", connected: true, color: "#0077ff" },
  { key: "yandex", name: "Яндекс.Музыка", connected: false, color: "#ffcc00" },
  { key: "apple", name: "Apple Music", connected: false, color: "#fa243c" },
  { key: "youtube", name: "YouTube Music", connected: false, color: "#ff0033" },
  { key: "soundcloud", name: "SoundCloud", connected: false, color: "#ff7700" },
  { key: "lastfm", name: "Last.fm", connected: true, color: "#d51007" },
  { key: "genius", name: "Genius (тексты)", connected: true, color: "#ffff64" },
];

export default function Integrations() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Plug className="size-5 text-brand" /> Интеграции</h1>
        <p className="text-sm text-muted-foreground">Подключите внешние сервисы для импорта плейлистов и обогащения данных.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((s) => (
          <div key={s.key} className="bg-panel border border-border/50 rounded-2xl p-4 flex items-center gap-4">
            <div
              className="size-12 rounded-xl grid place-items-center font-extrabold text-white"
              style={{ backgroundColor: s.color }}
            >
              {s.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-muted-foreground">
                {s.connected ? "Подключено" : "Не подключено"}
              </div>
            </div>
            {s.connected ? (
              <button
                onClick={() => toast.success(`Импорт из ${s.name} запущен (мок)`)}
                className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-subtle text-xs font-medium flex items-center gap-1.5"
              >
                <ArrowRightLeft className="size-3.5" /> Импорт
              </button>
            ) : (
              <button
                onClick={() => toast.message(`Подключаем ${s.name}...`)}
                className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold"
              >Подключить</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
