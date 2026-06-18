export interface Tag {
  id: string;
  label: string;
  color: string;
  visible: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year: number;
  duration: number; // seconds
  cover: string;
  addedAt: number; // timestamp
  addedCount: number; // how many times added to main library
  globalAddedCount: number; // across all platform users
  rating: number; // 1-5 stars
  isPrivate: boolean;
  inRecommendations: boolean;
  tags: Tag[];
  lyrics?: string;
}

export interface Playlist {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
  trackIds: string[];
}

export interface Artist {
  id: string;
  name: string;
  cover: string;
  monthlyListeners?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  nowPlayingId?: string;
}

export type RepeatMode = "off" | "playlist" | "one";
export type SortField = "default" | "date" | "title" | "artist" | "year";
export type SortDirection = "asc" | "desc";
