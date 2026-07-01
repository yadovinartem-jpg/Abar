import { useState, useEffect, useRef } from "react";
import { Plus, X, Check, Palette } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { TAG_COLORS } from "@/constants/mockData";
import type { Tag } from "@/types/music";
import { cn } from "@/lib/utils";

interface Props {
  trackId: string;
  onClose: () => void;
}

export default function TagPopover({ trackId, onClose }: Props) {
  const track = useLibrary((s) => s.tracks.find((t) => t.id === trackId));
  const addTag = useLibrary((s) => s.addTagToTrack);
  const updateTag = useLibrary((s) => s.updateTagOnTrack);
  const removeTag = useLibrary((s) => s.removeTagFromTrack);

  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState(TAG_COLORS[0]);
  const [showPalette, setShowPalette] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const t = window.setTimeout(() => document.addEventListener("mousedown", onDoc), 60);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [onClose]);

  if (!track) return null;

  const confirmAdd = () => {
    if (!label.trim()) return;
    addTag(trackId, { id: crypto.randomUUID(), label: label.trim(), color });
    setLabel("");
    setColor(TAG_COLORS[0]);
    setAdding(false);
    setShowPalette(false);
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditLabel(tag.label);
    setEditColor(tag.color);
  };

  const confirmEdit = () => {
    if (!editingId || !editLabel.trim()) return;
    updateTag(trackId, editingId, { label: editLabel.trim(), color: editColor });
    setEditingId(null);
  };

  return (
    <div
      ref={ref}
      className="absolute right-full top-0 mr-1 w-64 bg-panel border border-border rounded-xl shadow-2xl z-40 p-2 animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-1.5">
        Теги трека
      </div>

      <div className="space-y-1 max-h-56 overflow-auto pr-1">
        {track.tags.length === 0 && !adding && (
          <div className="text-xs text-muted-foreground px-1 py-1">Тегов нет</div>
        )}
        {track.tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-1 group">
            {editingId === tag.id ? (
              <>
                <button
                  onClick={() => setShowPalette((p) => !p)}
                  className="size-6 rounded-full shrink-0 ring-2 ring-transparent hover:ring-white/20"
                  style={{ backgroundColor: editColor }}
                />
                <input
                  autoFocus
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditingId(null); }}
                  className="flex-1 min-w-0 bg-elevated rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand/50"
                />
                <button onClick={confirmEdit} className="text-emerald-500 p-0.5"><Check className="size-3.5" /></button>
                <button onClick={() => setEditingId(null)} className="text-destructive p-0.5"><X className="size-3.5" /></button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 px-2 py-1 rounded-full text-[11px] font-medium truncate cursor-pointer"
                  style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                  onClick={() => startEdit(tag)}
                  title="Редактировать"
                >
                  {tag.label}
                </span>
                <button
                  onClick={() => removeTag(trackId, tag.id)}
                  className="text-muted-foreground hover:text-destructive p-0.5 opacity-0 group-hover:opacity-100"
                  title="Удалить"
                >
                  <X className="size-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* palette (shared for add and edit) */}
      {(adding || editingId) && showPalette && (
        <div className="mt-2 p-2 bg-elevated/60 rounded-lg">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (editingId) setEditColor(c); else setColor(c);
                }}
                className={cn(
                  "size-5 rounded-full transition-transform",
                  ((editingId ? editColor : color) === c) && "ring-2 ring-foreground scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">#</span>
            <input
              type="text"
              value={(editingId ? editColor : color).replace("#", "")}
              onChange={(e) => {
                let v = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                v = "#" + v.padEnd(6, "0");
                if (editingId) setEditColor(v); else setColor(v);
              }}
              className="flex-1 bg-panel rounded px-1.5 py-0.5 text-[11px] tabular-nums focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* add row */}
      <div className="mt-2 border-t border-border/60 pt-2">
        {adding ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPalette((p) => !p)}
              className="size-6 rounded-full shrink-0 ring-2 ring-transparent hover:ring-white/20 relative"
              style={{ backgroundColor: color }}
              title="Цвет"
            >
              <Palette className="size-3 text-white/70 absolute inset-0 m-auto" />
            </button>
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd();
                if (e.key === "Escape") { setAdding(false); setLabel(""); }
              }}
              placeholder="Название тега"
              className="flex-1 min-w-0 bg-elevated rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand/50"
            />
            <button onClick={confirmAdd} className="text-emerald-500 p-0.5"><Check className="size-3.5" /></button>
            <button onClick={() => { setAdding(false); setLabel(""); }} className="text-destructive p-0.5"><X className="size-3.5" /></button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-elevated hover:bg-subtle text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" /> Добавить тег
          </button>
        )}
      </div>
    </div>
  );
}
