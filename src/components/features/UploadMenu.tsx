import { useState } from "react";
import { Upload, Image as ImgIcon } from "lucide-react";
import { toast } from "sonner";

export default function UploadMenu({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("2025");
  const [cover, setCover] = useState("");

  return (
    <div className="absolute right-0 top-12 w-[360px] rounded-xl bg-panel border border-border shadow-2xl z-50 p-4 animate-scale-in space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="size-4 text-brand" />
        <div className="text-sm font-semibold">Загрузить трек</div>
      </div>

      <button className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-brand/60 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:bg-elevated/40 transition-colors">
        <Upload className="size-5" />
        <span>Перетащите аудиофайл сюда</span>
        <span className="opacity-70">или нажмите для выбора</span>
      </button>

      <Input label="Название" value={title} onChange={setTitle} />
      <Input label="Исполнитель" value={artist} onChange={setArtist} />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Год" value={year} onChange={setYear} />
        <Input label="Обложка (URL)" value={cover} onChange={setCover} />
      </div>

      <button
        className="w-full px-3 py-2 rounded-lg bg-elevated hover:bg-subtle text-xs flex items-center justify-center gap-2"
        onClick={() => toast.success("Обложка подтянута с Genius (мок)")}
      >
        <ImgIcon className="size-4" /> Подтянуть обложку с Genius
      </button>

      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-elevated hover:bg-subtle text-xs">Отмена</button>
        <button
          onClick={() => { toast.success("Трек загружен (мок)"); onClose(); }}
          className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold"
        >Загрузить</button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[11px] font-medium text-muted-foreground mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-elevated px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
      />
    </label>
  );
}
