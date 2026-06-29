import type { Track, Playlist, Artist, UserProfile, Tag } from "@/types/music";

const COVERS = [
  "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519508234439-4f23643125c1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1453979077999-50d2cd45dc66?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1483412468200-72182dc8e94e?w=400&h=400&fit=crop",
];

const ARTISTS_NAMES = [
  "Хлеб", "Молчат Дома", "PHARAOH", "Скриптонит", "Oxxxymiron", "ЛСП",
  "АИГЕЛ", "Boulevard Depo", "Slava Marlow", "Markul", "Husky", "Грибы",
  "Мумий Тролль", "Сплин", "Земфира", "Дельфин", "Каста", "Многоточие",
];

// Canonical "Genius" names (mock normalization map)
export const GENIUS_ARTIST_NAMES: Record<string, string> = {
  "хлеб": "Хлеб",
  "молчат дома": "Молчат Дома",
  "pharaoh": "PHARAOH",
  "скриптонит": "Скриптонит",
  "oxxxymiron": "Oxxxymiron",
  "лсп": "ЛСП",
  "аигел": "АИГЕЛ",
  "boulevard depo": "Boulevard Depo",
  "slava marlow": "Slava Marlow",
  "markul": "Markul",
  "husky": "Husky",
  "грибы": "Грибы",
};

const TITLES = [
  "Закрой глаза", "Север", "Ничей", "Бесконечность", "Гипноз", "Танцы",
  "Призраки", "Вечер", "Бессонница", "Холодная весна", "Серый дым", "Метро",
  "Радиоволна", "Полночь", "Сны наяву", "Океан", "Город", "Ливень",
  "Снежинки", "Облака", "Параллели", "Дороги", "Шёпот", "Эхо",
  "Тишина", "Звёзды", "Ветер", "Лабиринт", "Зеркало", "Пыль",
];

const TAG_COLORS = [
  "#a855f7", "#c084fc", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#ef4444", "#84cc16", "#f97316", "#8b5cf6",
];

const SAMPLE_TAGS: Tag[][] = [
  [{ id: "t1", label: "вайб", color: "#a855f7", visible: true }],
  [{ id: "t2", label: "за рулём", color: "#c084fc", visible: true }, { id: "t3", label: "вечер", color: "#ec4899", visible: true }],
  [{ id: "t4", label: "тренировка", color: "#f59e0b", visible: true }],
  [],
  [{ id: "t5", label: "лето", color: "#10b981", visible: true }],
  [{ id: "t6", label: "грусть", color: "#06b6d4", visible: true }],
  [],
  [{ id: "t7", label: "хит", color: "#ef4444", visible: true }, { id: "t8", label: "бэнгер", color: "#84cc16", visible: true }],
];

const SAMPLE_LYRICS = `[Куплет 1]
Закрой глаза, представь себе ту ночь
Когда мы шли по краю, не считая шагов
Город спал, а мы летели прочь
В свете фонарей, среди пустых дворов

[Припев]
И ничего не значит, и значит всё
Когда твой голос рядом — я не один
Тишина в наушниках поёт песню её
Под ритмы старых пластинок и новых седин

[Куплет 2]
Метро гудит, как сердце в груди
Пыль на ботинках, дым из окна
Ты говоришь: "пойдём ещё чуть пройди"
И мы идём, пока не сядет луна`;

function dur() {
  return 90 + Math.floor(Math.random() * 240);
}

export const MOCK_TRACKS: Track[] = Array.from({ length: 28 }, (_, i) => ({
  id: `track-${i + 1}`,
  title: TITLES[i % TITLES.length],
  artist: ARTISTS_NAMES[i % ARTISTS_NAMES.length],
  album: `Альбом ${i + 1}`,
  year: 2018 + (i % 8),
  duration: dur(),
  cover: COVERS[i % COVERS.length],
  addedAt: Date.now() - i * 3600 * 1000 * 12,
  addedCount: i % 4 === 0 ? 0 : (i % 3) + 1,
  globalAddedCount: Math.floor(Math.random() * 1500),
  rating: ((i % 5) + 1),
  isPrivate: false,
  inRecommendations: i % 7 !== 0,
  tags: SAMPLE_TAGS[i % SAMPLE_TAGS.length] ?? [],
  lyrics: SAMPLE_LYRICS,
}));

export const MOCK_PLAYLISTS: Playlist[] = [
  { id: "pl-1", title: "Ночные поездки", artist: "Вы", year: 2024, cover: COVERS[0], trackIds: MOCK_TRACKS.slice(0, 8).map(t => t.id), listenCount: 1248, isPublic: true },
  { id: "pl-2", title: "Утро в кофейне", artist: "Вы", year: 2023, cover: COVERS[2], trackIds: MOCK_TRACKS.slice(2, 10).map(t => t.id), listenCount: 832, isPublic: true },
  { id: "pl-3", title: "На пробежке", artist: "Вы", year: 2024, cover: COVERS[4], trackIds: MOCK_TRACKS.slice(5, 14).map(t => t.id), listenCount: 421, isPublic: true },
  { id: "pl-4", title: "Под дождём", artist: "Вы", year: 2022, cover: COVERS[6], trackIds: MOCK_TRACKS.slice(7, 15).map(t => t.id), listenCount: 612, isPublic: false },
  { id: "pl-5", title: "Вечеринка", artist: "Вы", year: 2024, cover: COVERS[8], trackIds: MOCK_TRACKS.slice(0, 12).map(t => t.id), listenCount: 2034, isPublic: true },
  { id: "pl-6", title: "Глубокий фокус", artist: "Вы", year: 2025, cover: COVERS[10], trackIds: MOCK_TRACKS.slice(3, 13).map(t => t.id), listenCount: 178, isPublic: true },
  { id: "pl-7", title: "Зимний альбом", artist: "Вы", year: 2023, cover: COVERS[12], trackIds: MOCK_TRACKS.slice(1, 9).map(t => t.id), listenCount: 945, isPublic: true },
  { id: "pl-8", title: "Дорожный микс", artist: "Вы", year: 2024, cover: COVERS[14], trackIds: MOCK_TRACKS.slice(4, 12).map(t => t.id), listenCount: 367, isPublic: true },
  { id: "pl-9", title: "Сны наяву", artist: "Вы", year: 2025, cover: COVERS[16], trackIds: MOCK_TRACKS.slice(6, 14).map(t => t.id), listenCount: 89, isPublic: false },
  { id: "pl-10", title: "Старые пластинки", artist: "Вы", year: 2021, cover: COVERS[1], trackIds: MOCK_TRACKS.slice(0, 6).map(t => t.id), listenCount: 1567, isPublic: true },
  { id: "pl-11", title: "Только бэнгеры", artist: "Вы", year: 2025, cover: COVERS[3], trackIds: MOCK_TRACKS.slice(2, 11).map(t => t.id), listenCount: 723, isPublic: true },
  { id: "pl-12", title: "Меланхолия", artist: "Вы", year: 2022, cover: COVERS[5], trackIds: MOCK_TRACKS.slice(5, 15).map(t => t.id), listenCount: 491, isPublic: true },
];

export const MOCK_ARTISTS: Artist[] = ARTISTS_NAMES.slice(0, 16).map((name, i) => ({
  id: `artist-${i + 1}`,
  name,
  cover: COVERS[(i * 2) % COVERS.length],
}));

export const MOCK_PROFILES: UserProfile[] = [
  { id: "u-1", username: "force", displayName: "Forсe", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop", nowPlayingId: "track-3" },
  { id: "u-2", username: "himblock", displayName: "Хим Блок", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", nowPlayingId: "track-5" },
  { id: "u-3", username: "myverova", displayName: "Мой Верова", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
  { id: "u-4", username: "tema", displayName: "Тёма", avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop", nowPlayingId: "track-8" },
  { id: "u-5", username: "anna_w", displayName: "Anna W.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { id: "u-6", username: "vlad_k", displayName: "Vlad K.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" },
];

export const CURRENT_USER: UserProfile = {
  id: "me",
  username: "you",
  displayName: "Вы",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
};

export { TAG_COLORS };
