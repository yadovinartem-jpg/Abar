import { usePlayer } from "@/stores/playerStore";
import Modal from "./Modal";

export default function LyricsModal() {
  const open = usePlayer((s) => s.showLyrics);
  const toggle = usePlayer((s) => s.toggleLyrics);
  const t = usePlayer((s) => s.current);

  return (
    <Modal open={open} onClose={toggle} title={t ? `Текст · ${t.title}` : "Текст"}>
      {!t ? (
        <div className="text-center text-muted-foreground py-12">Сначала запустите трек</div>
      ) : (
        <div className="grid grid-cols-[180px_1fr] gap-6">
          <div>
            <img src={t.cover} alt="" className="w-full rounded-xl shadow-lg" />
            <div className="mt-3 text-sm font-semibold">{t.title}</div>
            <div className="text-xs text-muted-foreground">{t.artist}</div>
          </div>
          <div className="text-[15px] leading-[1.85] whitespace-pre-line">
            {t.lyrics ?? "Текст для этого трека пока не подтянут с Genius."}
          </div>
        </div>
      )}
      <div className="mt-4 text-[11px] text-muted-foreground/70">
        Тексты подтягиваются с Genius (моки в V1.0).
      </div>
    </Modal>
  );
}
