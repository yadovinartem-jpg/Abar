import RecentlyPlayed from "@/components/features/RecentlyPlayed";
import Playlists from "@/components/features/Playlists";
import Artists from "@/components/features/Artists";
import TracksList from "@/components/features/TracksList";

export default function MyMusic() {
  return (
    <div className="space-y-10">
      <RecentlyPlayed />
      <Playlists />
      <Artists />
      <TracksList />
    </div>
  );
}
