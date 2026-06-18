import { useState, useEffect } from "react";
import { Image } from "lucide-react";
import Modal from "./Modal";
import { useLibrary } from "@/stores/libraryStore";
import type { Track } from "@/types/music";
import { toast } from "sonner";

interface Props { trackId: string | null; onClose: () => void; }

export default function EditTrackModal({ trackId, onClose }: Props) {
  const tracks = useLibrary((s) => s.tracks);
  const update = useLibrary((s) => s.updateTrack);
  const t = tracks.find((x) => x.id === trackId) ?? null;
  const [draft, setDraft] = useState<Partial<Track>>({});

  useEffect(() => {
    if (t) setDraft({ title: t.title, artist: t.artist, year: t.year, cover: t.cover, album: t.album });
  }, [t]);

  if (!t) return null;

  return (
    <Modal open={!!t} onClose={onClose} title="Редактировать трек">
      <div className="grid grid-cols-[180px_1fr] gap-6">
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-elevated">
            <img src={draft.cover ?? t.cover} alt="" className="size-full object-cover" />
          </div>
          <button className="w-full px-3 py-2 rounded-lg bg-elevated hover:bg-subtle text-xs flex items-center justify-center gap-2"
            onClick={() => toast.success("Обложка подтянута с Genius (мок)")}>
            <Image className="size-4" /> Подтянуть с Genius
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Название">
            <input className="w-full bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Исполнитель">
            <input className="w-full bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={draft.artist ?? ""} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} />
          </Field>
          <Field label="Альбом">
            <input className="w-full bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={draft.album ?? ""} onChange={(e) => setDraft({ ...draft, album: e.target.value })} />
          </Field>
          <Field label="Год">
            <input type="number" className="w-32 bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={draft.year ?? 0} onChange={(e) => setDraft({ ...draft, year: +e.target.value })} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-elevated hover:bg-subtle text-sm">Отмена</button>
            <button
              onClick={() => { update(t.id, draft); toast.success("Сохранено"); onClose(); }}
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold"
            >Сохранить</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
