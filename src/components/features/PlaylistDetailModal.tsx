import { useState, useEffect, useRef } from "react";
import {
  Play, Shuffle, Share2, Pencil, Trash2, X, Eye, EyeOff,
  Image as ImgIcon, Search, Plus, Upload as UploadIcon, Music,
} from "lucide-react";
import Modal from "./Modal";
import { useLibrary } from "@/stores/libraryStore";
import { usePlayer } from "@/stores/playerStore";
import { formatTime, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Playlist, Track } from "@/types/music";

interface Props {
  playlist: Playlist | null;
  onClose: () => void;
  artistMode?: boolean; // no edit/delete in artist mode
}

export default function PlaylistDetailModal({ playlist, onClose, artistMode = false }: Props) {
  const lib = useLibrary();
  const player = usePlayer();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Playlist>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (playlist) {
      setDraft({
        title: playlist.title,
        artist: playlist.artist,
        year: playlist.year,
        cover: playlist.cover,
        isPublic: playlist.isPublic ?? true,
      });
      setEditing(false);
      setConfirmDelete(false);
      setSearch("");
    }
  }, [playlist?.id]);

  if (!playlist) return null;

  const tracks = playlist.trackIds
    .map((id) => lib.tracks.find((t) => t.id === id))
    .filter(Boolean) as Track[];
  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
  const listenCount = playlist.listenCount ?? 0;

  const handlePlay = () => {
    if (!tracks.length) return;
    player.loadQueue(tracks, 0);
    onClose();
  };
  const handleShuffle = () => {
    if (!tracks.length) return;
    player.loadQueue([...tracks].sort(() => Math.random() - 0.5), 0);
    onClose();
  };
  const handleSave = () => {
    lib.updatePlaylist(playlist.id, draft);
    toast.success("Плейлист сохранён");
    setEditing(false);
  };
  const handleDelete = () => {
    lib.deletePlaylist(playlist.id);
    toast.success("Плейлист удалён");
    onClose();
  };
  const handleCoverClick = () => {
    if (editing) fileRef.current?.click();
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDraft({ ...draft, cover: url });
    toast.success("Обложка загружена");
  };

  const searchResults = search.trim()
    ? lib.tracks
        .filter(
          (t) =>
            !playlist.trackIds.includes(t.id) &&
            (t.title.toLowerCase().includes(search.toLowerCase()) ||
              t.artist.toLowerCase().includes(search.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  return (
    <Modal open={!!playlist} onClose={onClose} title="" className="max-w-3xl">
      <div className="relative">
        {confirmDelete && (
          <div className="absolute inset-0 z-20 bg-panel/95 backdrop-blur-sm grid place-items-center rounded-xl -m-2 p-2">
            <div className="text-center space-y-4 p-6 max-w-sm">
              <div className="mx-auto size-14 rounded-full bg-destructive/15 grid place-items-center">
                <Trash2 className="size-6 text-destructive" />
              </div>
              <div className="text-lg font-bold">Удалить плейлист?</div>
              <div className="text-sm text-muted-foreground">
                «{playlist.title}» будет безвозвратно удалён.
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg bg-elevated hover:bg-subtle text-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-[200px_1fr] gap-5 relative">
            {/* delete button — top right of info area */}
            {!artistMode && !editing && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="absolute right-0 top-0 size-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 grid place-items-center text-destructive transition-colors"
                title="Удалить плейлист"
              >
                <Trash2 className="size-4" />
              </button>
            )}

            {/* cover */}
            <div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
              <div
                onClick={handleCoverClick}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden bg-elevated relative",
                  editing && "cursor-pointer ring-2 ring-brand/60 hover:ring-brand"
                )}
              >
                <img src={draft.cover ?? playlist.cover} alt="" className="size-full object-cover" />
                {editing && (
                  <div className="absolute inset-0 bg-black/55 grid place-items-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-1 text-white">
                      <UploadIcon className="size-5" />
                      <div className="text-xs font-semibold">Загрузить</div>
                    </div>
                  </div>
                )}
              </div>
              {editing && (
                <button
                  onClick={() => toast.success("Обложка подтянута с Genius (мок)")}
                  className="mt-2 w-full px-2 py-1.5 rounded-lg bg-elevated hover:bg-subtle text-xs flex items-center justify-center gap-1.5 font-medium"
                >
                  <ImgIcon className="size-3.5" /> Подтянуть с Genius
                </button>
              )}
            </div>

            {/* info */}
            <div className="flex flex-col min-w-0">
              {editing ? (
                <>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Плейлист
                  </div>
                  <input
                    value={draft.title ?? ""}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Название"
                    className="bg-elevated text-2xl font-extrabold px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                  <input
                    value={draft.artist ?? ""}
                    onChange={(e) => setDraft({ ...draft, artist: e.target.value })}
                    placeholder="Автор"
                    className="bg-elevated text-sm px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                  <input
                    type="number"
                    value={draft.year ?? 0}
                    onChange={(e) => setDraft({ ...draft, year: +e.target.value })}
                    placeholder="Год"
                    className="bg-elevated text-sm w-28 px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </>
              ) : (
                <>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Плейлист {artistMode ? "артиста" : ""}
                  </div>
                  <div className="text-2xl font-extrabold mb-1 truncate">{playlist.title}</div>
                  <div className="text-sm text-muted-foreground mb-1">{playlist.artist}</div>
                  <div className="text-xs text-muted-foreground mb-4 tabular-nums">
                    {listenCount.toLocaleString("ru-RU")} прослушиваний
                    <span className="opacity-50 mx-1.5">·</span>
                    {tracks.length} {tracks.length === 1 ? "трек" : tracks.length < 5 ? "трека" : "треков"}
                    <span className="opacity-50 mx-1.5">·</span>
                    {formatTime(totalDuration)}
                  </div>
                </>
              )}

              {/* actions */}
              <div className="flex items-center gap-2 mt-auto flex-wrap">
                {!editing ? (
                  <>
                    <button
                      onClick={handlePlay}
                      className="size-11 rounded-full bg-brand hover:bg-brand/90 grid place-items-center shadow-lg shadow-brand/30 transition-transform hover:scale-105"
                      title="Воспроизвести"
                    >
                      <Play className="size-5 text-white ml-0.5" fill="white" />
                    </button>
                    <button
                      onClick={handleShuffle}
                      className="size-10 rounded-full bg-elevated hover:bg-subtle grid place-items-center transition-colors"
                      title="Случайно"
                    >
                      <Shuffle className="size-4" />
                    </button>
                    {!artistMode && (
                      <button
                        onClick={() => toast.success("Ссылка скопирована")}
                        className="size-10 rounded-full bg-elevated hover:bg-subtle grid place-items-center transition-colors"
                        title="Поделиться"
                      >
                        <Share2 className="size-4" />
                      </button>
                    )}
                    {!artistMode && (
                      <button
                        onClick={() => setEditing(true)}
                        className="size-10 rounded-full bg-elevated hover:bg-subtle grid place-items-center transition-colors"
                        title="Редактировать"
                      >
                        <Pencil className="size-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 rounded-lg bg-elevated hover:bg-subtle text-sm"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => setDraft({ ...draft, isPublic: !draft.isPublic })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                        draft.isPublic
                          ? "bg-brand/15 text-brand"
                          : "bg-elevated text-muted-foreground hover:bg-subtle"
                      )}
                      title={draft.isPublic ? "Виден в общем поиске" : "Скрыт от поиска"}
                    >
                      {draft.isPublic ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                      {draft.isPublic ? "Виден в поиске" : "Скрыт"}
                    </button>
                    <div className="ml-auto">
                      <button
                        onClick={() => setEditing(false)}
                        className="size-10 rounded-full bg-brand/15 ring-2 ring-brand grid place-items-center text-brand"
                        title="Режим редактирования"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* track search in edit mode */}
          {editing && (
            <div className="bg-elevated/40 rounded-xl p-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск треков из библиотеки для добавления"
                  className="w-full bg-panel pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-56 overflow-auto">
                  {searchResults.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-panel rounded-md"
                    >
                      <img src={t.cover} alt="" className="size-8 rounded object-cover" />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-medium truncate">{t.title}</div>
                        <div className="text-muted-foreground truncate">{t.artist}</div>
                      </div>
                      <button
                        onClick={() => {
                          lib.addTrackToPlaylist(playlist.id, t.id);
                          toast.success("Добавлено в плейлист");
                          setSearch("");
                        }}
                        className="size-7 rounded-full bg-brand hover:bg-brand/90 grid place-items-center"
                      >
                        <Plus className="size-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* tracks */}
          <div className="bg-panel/40 rounded-xl p-2 max-h-96 overflow-auto">
            {tracks.length === 0 ? (
              <div className="text-center py-10">
                <Music className="size-8 text-muted-foreground/50 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Треков пока нет</div>
              </div>
            ) : (
              tracks.map((t, i) => {
                const isCurr = player.current?.id === t.id;
                return (
                  <div
                    key={t.id + i}
                    className={cn(
                      "grid grid-cols-[28px_44px_1fr_auto_auto] items-center gap-3 px-2 py-1.5 rounded-md transition-colors",
                      isCurr ? "bg-brand/12" : "hover:bg-elevated/60"
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs tabular-nums text-center",
                        isCurr ? "text-brand font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </div>
                    <button
                      onClick={() => player.loadQueue(tracks, i)}
                      className="size-11 rounded overflow-hidden bg-elevated"
                    >
                      <img src={t.cover} alt="" className="size-full object-cover" />
                    </button>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "text-sm font-medium truncate",
                          isCurr ? "text-brand" : "text-foreground"
                        )}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{t.artist}</div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {formatTime(t.duration)}
                    </div>
                    {editing ? (
                      <button
                        onClick={() => {
                          lib.removeTrackFromPlaylist(playlist.id, t.id);
                          toast.message("Удалено из плейлиста");
                        }}
                        className="size-7 rounded grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Убрать из плейлиста"
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : (
                      <div className="size-7" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
