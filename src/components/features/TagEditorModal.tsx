import { useState, useEffect } from "react";
import { Plus, Eye, EyeOff, X } from "lucide-react";
import Modal from "./Modal";
import { useLibrary } from "@/stores/libraryStore";
import { TAG_COLORS } from "@/constants/mockData";
import type { Tag } from "@/types/music";

interface Props { trackId: string | null; onClose: () => void; }

export default function TagEditorModal({ trackId, onClose }: Props) {
  const tracks = useLibrary((s) => s.tracks);
  const update = useLibrary((s) => s.updateTrack);
  const t = tracks.find((x) => x.id === trackId) ?? null;
  const [tags, setTags] = useState<Tag[]>([]);
  const [draft, setDraft] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  useEffect(() => { if (t) setTags(t.tags); }, [t]);

  if (!t) return null;

  const add = () => {
    if (!draft.trim()) return;
    const next = [...tags, { id: crypto.randomUUID(), label: draft.trim(), color, visible: true }];
    setTags(next);
    setDraft("");
  };

  const save = () => { update(t.id, { tags }); onClose(); };

  return (
    <Modal open={!!t} onClose={onClose} title={`Теги · ${t.title}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && <div className="text-sm text-muted-foreground">Тегов нет</div>}
          {tags.map((tag, idx) => (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
            >
              <span>{tag.label}</span>
              <button
                onClick={() => setTags(tags.map((x, i) => i === idx ? { ...x, visible: !x.visible } : x))}
                className="opacity-70 hover:opacity-100"
                title="Видимость"
              >
                {tag.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              </button>
              <button
                onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                className="opacity-70 hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Название тега"
            className="flex-1 bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
          <div className="flex gap-1.5">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`size-6 rounded-full transition-transform ${color === c ? "ring-2 ring-foreground scale-110" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button onClick={add} className="size-9 rounded-lg bg-brand hover:bg-brand/90 text-white grid place-items-center">
            <Plus className="size-4" />
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-elevated hover:bg-subtle text-sm">Отмена</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold">Сохранить</button>
        </div>
      </div>
    </Modal>
  );
}
