import { useState } from "react";
import { ArrowRightLeft, Check } from "lucide-react";
import { toast } from "sonner";
import Modal from "./Modal";
import { cn } from "@/lib/utils";

type ServiceKey = "vk" | "yandex" | "spotify";

const services: Array<{ key: ServiceKey; name: string; color: string }> = [
  { key: "vk", name: "ВКонтакте", color: "#0077ff" },
  { key: "yandex", name: "Яндекс Музыка", color: "#ffcc00" },
  { key: "spotify", name: "Spotify", color: "#1ed760" },
];

interface Props { open: boolean; onClose: () => void }

export default function TransferModal({ open, onClose }: Props) {
  const [from, setFrom] = useState<ServiceKey>("spotify");
  const [playlists, setPlaylists] = useState(true);
  const [tracks, setTracks] = useState(true);

  const handle = () => {
    const name = services.find(s => s.key === from)?.name ?? "";
    const parts: string[] = [];
    if (playlists) parts.push("плейлисты");
    if (tracks) parts.push("треки");
    if (!parts.length) return toast.error("Выберите, что переносить");
    toast.success(`Перенос: ${parts.join(" и ")} из ${name}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Перенос с других площадок" className="max-w-md">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Импортируйте плейлисты и треки из подключённой платформы.
        </p>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Платформа
          </div>
          <div className="grid grid-cols-3 gap-2">
            {services.map((s) => (
              <button
                key={s.key}
                onClick={() => setFrom(s.key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                  from === s.key
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
            <CheckboxRow label="Плейлисты" checked={playlists} onChange={setPlaylists} />
            <CheckboxRow label="Треки" checked={tracks} onChange={setTracks} />
          </div>
        </div>

        <button
          onClick={handle}
          className="w-full px-4 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
        >
          <ArrowRightLeft className="size-4" /> Перенести
        </button>
      </div>
    </Modal>
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
