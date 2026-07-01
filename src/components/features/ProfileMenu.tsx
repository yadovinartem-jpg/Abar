import { useState } from "react";
import { Settings, UserCog, Wrench, ArrowRightLeft } from "lucide-react";
import { CURRENT_USER } from "@/constants/mockData";
import { toast } from "sonner";
import { useEditMode } from "@/stores/editModeStore";
import TransferModal from "./TransferModal";

export default function ProfileMenu({ onClose }: { onClose: () => void }) {
  const enterEdit = useEditMode((s) => s.enterEdit);
  const [transferOpen, setTransferOpen] = useState(false);

  const items = [
    {
      label: "Редактировать профиль",
      Icon: UserCog,
      hint: "пароль, почта, ник",
      onClick: () => { toast.message("Редактирование профиля"); onClose(); },
    },
    {
      label: "Режим редактирования",
      Icon: Wrench,
      hint: "редактирование, цвета, положение плашек",
      onClick: () => { enterEdit(); onClose(); },
    },
    {
      label: "Перенос с других площадок",
      Icon: ArrowRightLeft,
      hint: "Вконтакте, Яндекс, Spotify",
      onClick: () => { setTransferOpen(true); },
    },
    {
      label: "Настройки",
      Icon: Settings,
      hint: "приватность, уведомления",
      onClick: () => { toast.message("Настройки"); onClose(); },
    },
  ];

  return (
    <>
      <div className="absolute right-0 top-12 w-72 rounded-xl bg-panel border border-border shadow-2xl z-50 animate-scale-in overflow-hidden">
        <div className="p-4 flex flex-col items-center text-center border-b border-border/60">
          <img src={CURRENT_USER.avatar} alt="" className="size-16 rounded-full object-cover ring-2 ring-brand/50" />
          <div className="mt-2 text-sm font-semibold">{CURRENT_USER.displayName}</div>
          <div className="text-xs text-muted-foreground">@{CURRENT_USER.username}</div>
        </div>
        <div className="p-1.5">
          {items.map(({ label, Icon, hint, onClick }) => (
            <button
              key={label}
              onClick={onClick}
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

      <TransferModal open={transferOpen} onClose={() => { setTransferOpen(false); onClose(); }} />
    </>
  );
}
