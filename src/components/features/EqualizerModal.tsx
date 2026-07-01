import { useState, useRef, useEffect } from "react";
import { X, Save, Trash2, Pencil, Check } from "lucide-react";
import { usePlayer } from "@/stores/playerStore";
import { EQ_FREQUENCIES } from "@/constants/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function EqualizerModal({ onClose }: { onClose: () => void }) {
  const p = usePlayer();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [saveName, setSaveName] = useState("");
  const [savingOpen, setSavingOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    // slight delay so opener button click doesn't immediately close
    const t = window.setTimeout(() => document.addEventListener("mousedown", onDoc), 50);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [onClose]);

  const editableQ = (idx: number, value: number) => {
    return (
      <input
        type="text"
        value={value.toFixed(2)}
        onChange={(e) => {
          const v = parseFloat(e.target.value.replace(",", "."));
          if (!isNaN(v)) p.setEqQ(idx, v);
        }}
        onBlur={(e) => {
          const v = parseFloat(e.target.value.replace(",", "."));
          if (isNaN(v)) return;
          p.setEqQ(idx, v);
        }}
        className="w-10 text-center bg-transparent text-[9px] tabular-nums focus:outline-none focus:bg-elevated rounded"
      />
    );
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[560px] bg-panel border border-border rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden"
    >
      <div className="p-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Эквалайзер</span>
          <span className="text-[11px] text-muted-foreground">· {p.eqPreset}</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex">
        {/* preset list */}
        <div className="w-40 border-r border-border/60 p-2 max-h-[340px] overflow-auto">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 px-1">
            Пресеты
          </div>
          {p.savedPresets.map((pr) => (
            <div
              key={pr.name}
              className={cn(
                "group flex items-center gap-1 rounded-md",
                p.eqPreset === pr.name && "bg-brand/15 text-brand"
              )}
            >
              {renaming === pr.name ? (
                <div className="flex items-center gap-1 w-full px-1 py-0.5">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { p.renamePreset(pr.name, renameValue.trim() || pr.name); setRenaming(null); }
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    className="flex-1 bg-elevated rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand/40 min-w-0"
                  />
                  <button
                    onClick={() => { p.renamePreset(pr.name, renameValue.trim() || pr.name); setRenaming(null); }}
                    className="text-brand"
                  >
                    <Check className="size-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => p.applyPreset(pr.name)}
                    className="flex-1 text-left px-2 py-1.5 text-xs font-medium truncate hover:text-foreground"
                    title={pr.name}
                  >
                    {pr.name}
                  </button>
                  {!pr.builtIn && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center pr-1">
                      <button
                        onClick={() => { setRenaming(pr.name); setRenameValue(pr.name); }}
                        className="text-muted-foreground hover:text-foreground p-0.5"
                        title="Переименовать"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        onClick={() => p.deletePreset(pr.name)}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                        title="Удалить"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* save current */}
          <div className="mt-2 border-t border-border/60 pt-2">
            {savingOpen ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Название"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && saveName.trim()) {
                      p.savePreset(saveName);
                      toast.success("Пресет сохранён");
                      setSavingOpen(false);
                      setSaveName("");
                    }
                    if (e.key === "Escape") { setSavingOpen(false); setSaveName(""); }
                  }}
                  className="flex-1 min-w-0 bg-elevated rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand/40"
                />
                <button
                  onClick={() => {
                    if (!saveName.trim()) return;
                    p.savePreset(saveName);
                    toast.success("Пресет сохранён");
                    setSavingOpen(false);
                    setSaveName("");
                  }}
                  className="text-brand p-1"
                >
                  <Check className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSavingOpen(true)}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-elevated hover:bg-subtle text-[11px] font-semibold"
              >
                <Save className="size-3" /> Сохранить свой
              </button>
            )}
          </div>
        </div>

        {/* bands */}
        <div className="flex-1 p-4">
          <div className="flex justify-between gap-2 h-[280px]">
            {EQ_FREQUENCIES.map((label, i) => {
              const gain = p.eqBands[i];
              const q = p.eqQ[i];
              return (
                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                  {/* value on top */}
                  <div className="text-[9px] tabular-nums text-muted-foreground text-center leading-tight h-6 flex flex-col justify-end">
                    <div>{gain > 0 ? "+" : ""}{gain.toFixed(1)}</div>
                    <div className="opacity-60">{editableQ(i, q)}</div>
                  </div>
                  {/* two sliders side by side */}
                  <div className="flex items-center gap-1 h-full">
                    {/* main gain slider (vertical) */}
                    <div className="h-full flex items-center">
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        step={0.5}
                        value={gain}
                        onChange={(e) => p.setEqBand(i, +e.target.value)}
                        className="eq-slider"
                        style={{
                          WebkitAppearance: "slider-vertical",
                          appearance: "slider-vertical",
                          writingMode: "vertical-lr" as any,
                          width: 16,
                          height: "100%",
                        } as any}
                      />
                    </div>
                    {/* Q slider (vertical) */}
                    <div className="h-full flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.05}
                        value={q}
                        onChange={(e) => p.setEqQ(i, +e.target.value)}
                        className="eq-slider eq-slider-q"
                        style={{
                          WebkitAppearance: "slider-vertical",
                          appearance: "slider-vertical",
                          writingMode: "vertical-lr" as any,
                          width: 12,
                          height: "100%",
                        } as any}
                      />
                    </div>
                  </div>
                  {/* freq label */}
                  <div className="text-[10px] text-muted-foreground tabular-nums font-medium mt-0.5">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-muted-foreground/70 px-1">
            <span>gain -12..+12 дБ</span>
            <span>Q 0.00..3.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
