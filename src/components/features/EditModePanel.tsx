import { useEffect, useRef, useState } from "react";
import { X, Check, Image as ImgIcon, Palette, Sparkles, Save, Trash2, Pencil } from "lucide-react";
import { useEditMode } from "@/stores/editModeStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SWATCHES = [
  "#0d0e13", "#111319", "#1a1d29", "#0f1b2d", "#1a1030",
  "#3b0a3a", "#1f0640", "#0a2540", "#0e2a1c", "#2d1a0a",
];

export default function EditModePanel() {
  const s = useEditMode();
  const [presetName, setPresetName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // ESC = cancel
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") s.cancelEdit();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    s.setDraftBgImage(url);
  };

  const currentColor = s.draftBackgroundColor;

  return (
    <div className="fixed top-[110px] right-4 bottom-4 w-[300px] z-50 bg-panel/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="size-4 text-brand" />
          <div className="text-sm font-bold">Режим редактирования</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { s.saveEdit(); toast.success("Изменения сохранены"); }}
            className="size-8 rounded-md bg-brand hover:bg-brand/90 text-white grid place-items-center"
            title="Сохранить"
          >
            <Check className="size-4" />
          </button>
          <button
            onClick={() => { s.cancelEdit(); toast.message("Изменения отменены"); }}
            className="size-8 rounded-md bg-destructive/15 hover:bg-destructive/25 text-destructive grid place-items-center"
            title="Отменить"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="p-3 overflow-auto flex-1 space-y-4">
        {/* Background color */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            <Palette className="size-3" /> Фон приложения
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="size-9 rounded-md border border-border/60 shrink-0"
              style={{ background: currentColor }}
            />
            <div className="flex-1 flex items-center gap-1">
              <span className="text-xs text-muted-foreground">#</span>
              <input
                type="text"
                value={currentColor.replace("#", "").replace(/hsl.*/, "").slice(0, 6)}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                  if (v.length === 6) s.setDraftBg("#" + v);
                }}
                className="flex-1 bg-elevated rounded px-2 py-1 text-xs tabular-nums focus:outline-none min-w-0"
                placeholder="000000"
              />
              <input
                type="color"
                value={currentColor.startsWith("#") ? currentColor : "#0d0e13"}
                onChange={(e) => s.setDraftBg(e.target.value)}
                className="size-7 rounded cursor-pointer bg-transparent border border-border/60"
                title="Палитра"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => s.setDraftBg(c)}
                className="aspect-square rounded-md border border-border/50 hover:scale-110 transition-transform"
                style={{ background: c }}
              />
            ))}
          </div>
          {s.recentColors.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] text-muted-foreground font-semibold mb-1">Недавние цвета</div>
              <div className="flex gap-1.5">
                {s.recentColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => s.setDraftBg(c)}
                    className="size-6 rounded-full border border-border/60 hover:scale-110 transition-transform"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Background image */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            <ImgIcon className="size-3" /> Фото фона
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 px-2 py-2 rounded-md bg-elevated hover:bg-subtle text-xs font-semibold"
            >
              Загрузить
            </button>
            {s.draftBackgroundImage && (
              <button
                onClick={() => s.setDraftBgImage(null)}
                className="px-2 py-2 rounded-md bg-destructive/15 hover:bg-destructive/25 text-destructive text-xs font-semibold"
              >
                Убрать
              </button>
            )}
          </div>
          {s.draftBackgroundImage && (
            <div className="mt-2 aspect-video rounded-md overflow-hidden border border-border/60">
              <img src={s.draftBackgroundImage} alt="" className="size-full object-cover" />
            </div>
          )}
          {s.recentImages.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] text-muted-foreground font-semibold mb-1">Недавние фото</div>
              <div className="grid grid-cols-5 gap-1.5">
                {s.recentImages.map((img) => (
                  <button
                    key={img}
                    onClick={() => s.setDraftBgImage(img)}
                    className="aspect-square rounded-md overflow-hidden border border-border/60 hover:scale-105 transition-transform"
                  >
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Interactive background */}
        <section>
          <button
            onClick={() => s.setDraftInteractive(!s.draftInteractive)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
              s.draftInteractive
                ? "bg-brand/15 text-brand border-brand/40"
                : "bg-elevated border-border hover:bg-subtle"
            )}
          >
            <Sparkles className="size-4" />
            <span className="flex-1 text-left">Интерактивный фон</span>
            <span className="text-[10px] opacity-70">{s.draftInteractive ? "вкл" : "выкл"}</span>
          </button>
          <div className="text-[10px] text-muted-foreground mt-1 px-1">
            Фон становится градиентом обложки текущего трека.
          </div>
        </section>

        {/* Presets */}
        <section>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            <Save className="size-3" /> Пресеты
          </div>
          <div className="flex items-center gap-1 mb-2">
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Название пресета"
              onKeyDown={(e) => {
                if (e.key === "Enter" && presetName.trim()) {
                  s.savePreset(presetName);
                  toast.success("Пресет сохранён");
                  setPresetName("");
                }
              }}
              className="flex-1 min-w-0 bg-elevated rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand/40"
            />
            <button
              onClick={() => {
                if (!presetName.trim()) return;
                s.savePreset(presetName);
                toast.success("Пресет сохранён");
                setPresetName("");
              }}
              className="p-1.5 rounded bg-brand hover:bg-brand/90 text-white"
            >
              <Save className="size-3.5" />
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-auto">
            {s.presets.length === 0 && (
              <div className="text-[11px] text-muted-foreground px-1">Пока нет пресетов</div>
            )}
            {s.presets.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-1 rounded-md group",
                  s.activePresetId === p.id && "bg-brand/15 text-brand"
                )}
              >
                {renamingId === p.id ? (
                  <>
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { s.renamePreset(p.id, renameVal.trim() || p.name); setRenamingId(null); }
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="flex-1 min-w-0 bg-elevated rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand/40"
                    />
                    <button onClick={() => { s.renamePreset(p.id, renameVal.trim() || p.name); setRenamingId(null); }} className="text-brand p-0.5">
                      <Check className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { s.applyPreset(p.id); toast.message("Пресет применён"); }}
                      className="flex-1 text-left px-2 py-1.5 text-xs font-medium truncate"
                    >
                      {p.name}
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center pr-1">
                      <button
                        onClick={() => { setRenamingId(p.id); setRenameVal(p.name); }}
                        className="text-muted-foreground hover:text-foreground p-0.5"
                        title="Переименовать"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        onClick={() => s.deletePreset(p.id)}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                        title="Удалить"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="px-3 py-2 border-t border-border/60 text-[10px] text-muted-foreground">
        Нажмите на плашку в приложении и перетащите её в нужное место.
      </div>
    </div>
  );
}
