import { useState } from "react";
import { Plug2, Check } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/features/Modal";
import { cn } from "@/lib/utils";

type ServiceKey = "vk" | "yandex" | "spotify" | "genius";
interface Service { key: ServiceKey; name: string; color: string; connected: boolean; }

const initialServices: Service[] = [
  { key: "vk", name: "ВКонтакте", color: "#0077ff", connected: true },
  { key: "yandex", name: "Яндекс Музыка", color: "#ffcc00", connected: false },
  { key: "spotify", name: "Spotify", color: "#1ed760", connected: true },
];

const initialGenius: Service = { key: "genius", name: "Genius (тексты)", color: "#ffff64", connected: true };

export default function Integrations() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [genius, setGenius] = useState<Service>(initialGenius);
  const [authService, setAuthService] = useState<Service | null>(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Plug2 className="size-5 text-brand" /> Интеграции
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Подключите внешние сервисы для переноса треков и использования рекомендаций.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        <div className="space-y-3">
          <ServiceCard
            service={genius}
            onConnect={() => setAuthService(genius)}
            onDisconnect={() => {
              setGenius({ ...genius, connected: false });
              toast.message("Genius отключён");
            }}
          />
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
