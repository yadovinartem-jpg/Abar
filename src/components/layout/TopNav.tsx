import { NavLink } from "react-router-dom";
import { Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import ProfileMenu from "@/components/features/ProfileMenu";
import UploadMenu from "@/components/features/UploadMenu";
import { CURRENT_USER } from "@/constants/mockData";

const tabs = [
  { to: "/my-music", label: "Моя музыка" },
  { to: "/search", label: "Поиск" },
  { to: "/recommendations", label: "Рекомендации" },
  { to: "/statistics", label: "Статистика" },
  { to: "/releases", label: "Релизы" },
  { to: "/integrations", label: "Интеграции" },
  { to: "/radio", label: "Радио" },
];

export default function TopNav() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) {
        setProfileOpen(false);
        setUploadOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="px-4 pt-3">
      <div className="mx-auto max-w-[1280px] flex items-center gap-4 px-2">
        {/* logo — non-clickable */}
        <div className="flex items-center gap-2 mr-2 select-none">
          <div className="size-8 rounded-full bg-gradient-to-br from-brand to-brand/40 grid place-items-center font-extrabold text-white text-[13px] shadow-md shadow-brand/30">
            A
          </div>
          <div className="text-[15px] font-extrabold tracking-wide">ABAR</div>
        </div>

        {/* tabs */}
        <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-elevated/60"
                )
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        {/* right cluster */}
        <div ref={wrap} className="relative flex items-center gap-2">
          <button
            onClick={() => { setUploadOpen((o) => !o); setProfileOpen(false); }}
            className="size-9 rounded-full bg-elevated hover:bg-subtle grid place-items-center transition-colors"
            title="Загрузить трек"
          >
            <Upload className="size-4" />
          </button>

          <button
            onClick={() => { setProfileOpen((o) => !o); setUploadOpen(false); }}
            className="size-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-brand/60 transition-all"
          >
            <img src={CURRENT_USER.avatar} alt="" className="size-full object-cover" />
          </button>

          {profileOpen && <ProfileMenu onClose={() => setProfileOpen(false)} />}
          {uploadOpen && <UploadMenu onClose={() => setUploadOpen(false)} />}
        </div>
      </div>
    </div>
  );
}
