import { Skull, Radiation, Heart } from "lucide-react";
import { APP_VERSION } from "@/constants/mockData";
import logo from "@/assets/abar-logo.png";

const team = [
  { name: "FORSITY", Icon: Skull },
  { name: "ZERROW", Icon: Radiation },
  { name: "Котейка", Icon: Heart },
];

export default function Footer() {
  return (
    <footer className="pt-12 pb-4 border-t border-border/40 mt-12">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
        {team.map(({ name, Icon }) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className="size-7 rounded-full grid place-items-center text-muted-foreground">
              <Icon className="size-[18px]" strokeWidth={1.75} />
            </div>
            <span className="text-[13px] font-normal tracking-wide text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <img src={logo} alt="" className="size-4 object-contain opacity-80" />
        <span className="font-bold tracking-wide text-foreground/70">ABAR v{APP_VERSION}</span>
        <span className="opacity-40">·</span>
        <span>FORSITY Interteiment</span>
        <span className="opacity-40">·</span>
        <span>2026</span>
        <span className="opacity-40">·</span>
        <span className="flex items-center gap-1">
          Russia
          <span className="inline-flex w-4 h-3 overflow-hidden rounded-[2px] ring-1 ring-border/60">
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#0039a6]" />
            <span className="flex-1 bg-[#d52b1e]" />
          </span>
        </span>
      </div>
    </footer>
  );
}
