import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import Modal from "./Modal";

export default function Artists() {
  const artists = useLibrary((s) => s.artists);
  const scroller = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const scrollBy = (d: 1 | -1) => scroller.current?.scrollBy({ left: d * 480, behavior: "smooth" });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Музыканты</h2>
          <button onClick={() => setShowAll(true)} className="text-xs text-brand hover:underline">показать все</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scrollBy(-1)} className="size-8 rounded-full bg-elevated hover:bg-subtle grid place-items-center"><ChevronLeft className="size-4" /></button>
          <button onClick={() => scrollBy(1)} className="size-8 rounded-full bg-elevated hover:bg-subtle grid place-items-center"><ChevronRight className="size-4" /></button>
        </div>
      </div>

      <div ref={scroller} className="overflow-x-auto scroll-smooth">
        <div className="flex gap-4 min-w-max pb-2">
          {artists.map((a) => (
            <div key={a.id} className="w-[150px] text-center cursor-pointer group">
              <div className="aspect-square rounded-full overflow-hidden bg-elevated ring-1 ring-border/50">
                <img src={a.cover} alt="" className="size-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="mt-2 text-sm font-semibold truncate">{a.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {a.monthlyListeners?.toLocaleString("ru-RU")} слушателей
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Все музыканты" className="max-w-5xl">
        <div className="grid grid-cols-4 gap-6">
          {artists.map((a) => (
            <div key={a.id} className="text-center">
              <div className="aspect-square rounded-full overflow-hidden bg-elevated">
                <img src={a.cover} alt="" className="size-full object-cover" />
              </div>
              <div className="mt-2 text-sm font-semibold">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.monthlyListeners?.toLocaleString("ru-RU")}</div>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  );
}
