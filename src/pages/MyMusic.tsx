import RecentlyPlayed from "@/components/features/RecentlyPlayed";
import Playlists from "@/components/features/Playlists";
import Artists from "@/components/features/Artists";
import TracksList from "@/components/features/TracksList";
import DraggablePanel from "@/components/features/DraggablePanel";

export default function MyMusic() {
  return (
    <div className="space-y-10">
      <DraggablePanel id="recently-played">
        <RecentlyPlayed />
      </DraggablePanel>
      <DraggablePanel id="playlists">
        <Playlists />
      </DraggablePanel>
      <DraggablePanel id="artists">
        <Artists />
      </DraggablePanel>
      <DraggablePanel id="tracks">
        <TracksList />
      </DraggablePanel>
    </div>
  );
}
