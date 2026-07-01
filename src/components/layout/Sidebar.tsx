import { useState } from "react";
import { Search, Bookmark, BookmarkX } from "lucide-react";
import { useLibrary } from "@/stores/libraryStore";
import { toast } from "sonner";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const profiles = useLibrary((s) => s.profiles);
  const saved = useLibrary((s) => s.savedProfileIds);
  const saveProfile = useLibrary((s) => s.saveProfile);
  const unsaveProfile = useLibrary((s) => s.unsaveProfile);

  const results = query.trim()
    ? profiles.filter((p) =>
        p.username.toLowerCase().includes(query.toLowerCase()) ||
        p.displayName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const savedProfiles = profiles.filter((p) => saved.includes(p.id));

  return (
    <div className="sticky top-[120px]">
      <div className="bg-panel rounded-2xl border border-border/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60">
          <div className="text-sm font-semibold">Музыка пользователей</div>
        </div>

        <div className="px-3 pb-3 pt-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти пользователя"
              className="w-full bg-elevated rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>

          {query && (
            <div className="space-y-1 max-h-72 overflow-auto">
              {results.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground">Никого не найдено</div>
              ) : results.map((p) => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-elevated/70">
                  <img src={p.avatar} alt="" className="size-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">@{p.username}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (saved.includes(p.id)) {
                        unsaveProfile(p.id);
                        toast.message("Профиль убран");
                      } else {
                        saveProfile(p.id);
                        toast.success("Профиль сохранён");
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title={saved.includes(p.id) ? "Убрать" : "Сохранить"}
                  >
                    {saved.includes(p.id) ? <BookmarkX className="size-4" /> : <Bookmark className="size-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <>
              <div className="px-2 pt-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Сохранённые
              </div>
              <div className="space-y-1">
                {savedProfiles.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    Пока пусто. Найдите кого-нибудь выше.
                  </div>
                ) : savedProfiles.map((p) => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-elevated/70 transition-colors text-left"
                  >
                    <img src={p.avatar} alt="" className="size-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.nowPlayingId ? "сейчас слушает" : `@${p.username}`}
                      </div>
                    </div>
                    {p.nowPlayingId && (
                      <span className="size-2 rounded-full bg-brand animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
