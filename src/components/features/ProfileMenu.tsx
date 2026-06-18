import { Settings, UserCog, Wrench, ArrowRightLeft } from "lucide-react";
import { CURRENT_USER } from "@/constants/mockData";
import { toast } from "sonner";

export default function ProfileMenu({ onClose }: { onClose: () => void }) {
  const items = [
    { label: "Редактировать профиль", Icon: UserCog, hint: "пароль, почта, ник" },
    { label: "Режим редактирования", Icon: Wrench, hint: "массовая правка треков" },
    { label: "Перенос с других площадок", Icon: ArrowRightLeft, hint: "Spotify, ВК, Apple" },
    { label: "Настройки", Icon: Settings, hint: "приватность, уведомления" },
  ];
  return (
    <div className="absolute right-0 top-12 w-72 rounded-xl bg-panel border border-border shadow-2xl z-50 animate-scale-in overflow-hidden">
      <div className="p-4 flex flex-col items-center text-center border-b border-border/60">
        <img src={CURRENT_USER.avatar} alt="" className="size-16 rounded-full object-cover ring-2 ring-brand/50" />
        <div className="mt-2 text-sm font-semibold">{CURRENT_USER.displayName}</div>
        <div className="text-xs text-muted-foreground">@{CURRENT_USER.username}</div>
      </div>
      <div className="p-1.5">
        {items.map(({ label, Icon, hint }) => (
          <button
            key={label}
            onClick={() => { toast.message(label); onClose(); }}
            className="w-full px-3 py-2 rounded-lg hover:bg-elevated text-left flex items-start gap-3 transition-colors"
          >
            <Icon className="size-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{label}</div>
              <div className="text-[11px] text-muted-foreground">{hint}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
