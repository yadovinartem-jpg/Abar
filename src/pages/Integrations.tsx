import { useState } from "react";
import { ArrowRightLeft, Check } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/features/Modal";
import { cn } from "@/lib/utils";

type ServiceKey = "vk" | "yandex" | "spotify" | "genius";
interface Service { key: ServiceKey; name: string; color: string; connected: boolean; }

const initialServices: Service[] = [
  { key: "vk", name: "ВКонтакте", color: "#0077ff", connected: true },
  { key: "yandex", name: "Яндекс.Музыка", color: "#ffcc00", connected: false },
  { key: "spotify", name: "Spotify", color: "#1ed760", connected: true },
];

const initialGenius: Service = { key: "genius", name: "Genius (тексты)", color: "#ffff64", connected: true };

export default function Integrations() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [genius, setGenius] = useState<Service>(initialGenius);
  const [authService, setAuthService] = useState<Service | null>(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  // transfer form
  const [transferFrom, setTransferFrom] = useState<ServiceKey>("spotify");
  const [transferPlaylists, setTransferPlaylists] = useState(true);
  const [transferTracks, setTransferTracks] = useState(true);

  const submitAuth = () => {
    if (!authService) return;
    if (authService.key === "genius") {
      setGenius({ ...genius, connected: true });
    } else {
      setServices(services.map((s) => (s.key === authService.key ? { ...s, connected: true } : s)));
    }
    toast.success(`${authService.name} подключён`);
    setAuthService(null);
    setLogin("");
    setPassword("");
  };

  const handleTransfer = () => {
    const fromName = services.find((s) => s.key === transferFrom)?.name ?? "сервиса";
    const parts: string[] = [];
    if (transferPlaylists) parts.push("плейлисты");
    if (transferTracks) parts.push("треки");
    if (!parts.length) {
      toast.error("Выберите, что переносить");
      return;
    }
    toast.success(`Перенос: ${parts.join(" и ")} из ${fromName}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Интеграции</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Подключите внешние сервисы для переноса треков и использования рекомендаций.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* left column: vk, yandex, spotify */}
        <div className="space-y-3">
          {services.map((s) => (
            <ServiceCard
              key={s.key}
              service={s}
              onConnect={() => setAuthService(s)}
              onDisconnect={() => {
                setServices(services.map((x) => (x.key === s.key ? { ...x, connected: false } : x)));
                toast.message(`${s.name} отключён`);
              }}
            />
          ))}
        </div>

        {/* right column: genius + transfer */}
        <div className="space-y-3">
          <ServiceCard
            service={genius}
            onConnect={() => setAuthService(genius)}
            onDisconnect={() => {
              setGenius({ ...genius, connected: false });
              toast.message("Genius отключён");
            }}
          />

          <div className="bg-panel border border-border/50 rounded-2xl p-4 space-y-4">
            <div>
              <div className="text-sm font-semibold mb-0.5">Перенос треков</div>
              <div className="text-xs text-muted-foreground">
                Импортируйте плейлисты и треки из подключённой платформы.
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Платформа
              </div>
              <div className="grid grid-cols-3 gap-2">
                {services.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setTransferFrom(s.key)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                      transferFrom === s.key
                        ? "bg-brand/15 text-brand border-brand/40"
                        : "bg-elevated border-border hover:bg-subtle"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Что переносим
              </div>
              <div className="space-y-1.5">
                <CheckboxRow
                  label="Плейлисты"
                  checked={transferPlaylists}
                  onChange={setTransferPlaylists}
                />
                <CheckboxRow
                  label="Треки"
                  checked={transferTracks}
                  onChange={setTransferTracks}
                />
              </div>
            </div>

            <button
              onClick={handleTransfer}
              className="w-full px-4 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
            >
              <ArrowRightLeft className="size-4" /> Перенести
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={!!authService}
        onClose={() => setAuthService(null)}
        title={authService ? `Подключить · ${authService.name}` : ""}
        className="max-w-md"
      >
        {authService && (
          <div className="space-y-4">
            <div
              className="size-14 rounded-2xl mx-auto grid place-items-center font-extrabold text-white text-xl"
              style={{ backgroundColor: authService.color }}
            >
              {authService.name[0]}
            </div>
            <label className="block">
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Email или логин</div>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </label>
            <label className="block">
              <div className="text-xs font-medium text-muted-foreground mb-1.5">Пароль</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAuthService(null)}
                className="px-4 py-2 rounded-lg bg-elevated hover:bg-subtle text-sm"
              >
                Отмена
              </button>
              <button
                onClick={submitAuth}
                className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold"
              >
                Войти
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ServiceCard({
  service, onConnect, onDisconnect,
}: { service: Service; onConnect: () => void; onDisconnect: () => void }) {
  return (
    <div className="bg-panel border border-border/50 rounded-2xl p-4 flex items-center gap-4">
      <div
        className="size-12 rounded-xl grid place-items-center font-extrabold text-white text-base shrink-0"
        style={{ backgroundColor: service.color }}
      >
        {service.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{service.name}</div>
        <div className={cn("text-xs flex items-center gap-1.5", service.connected ? "text-brand" : "text-muted-foreground")}>
          {service.connected && <Check className="size-3" />}
          {service.connected ? "Подключено" : "Не подключено"}
        </div>
      </div>
      {service.connected ? (
        <button
          onClick={onDisconnect}
          className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-subtle text-xs font-medium"
        >
          Отключить
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold"
        >
          Подключить
        </button>
      )}
    </div>
  );
}

function CheckboxRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-elevated/60 text-left"
    >
      <div
        className={cn(
          "size-5 rounded grid place-items-center transition-colors",
          checked ? "bg-brand text-white" : "bg-elevated"
        )}
      >
        {checked && <Check className="size-3.5" />}
      </div>
      <div className="text-sm font-medium">{label}</div>
    </button>
  );
}
