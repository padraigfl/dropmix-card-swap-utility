import { useMemo } from 'react';
import cardDb from './cardDb.json';
import { CardKey, Playlist } from './datasets';


const PlaylistList = () => {
  const playlists = useMemo(() => {
    return Object.entries(cardDb).reduce((playlists, [id, currentCard]) => {
      const playlistName = currentCard['Series Icon']
      if (playlists[playlistName]) {
        playlists[playlistName].push(id as CardKey);
      } else {
        playlists[playlistName] = [id as CardKey];
      }
      return playlists;
    }, {} as Playlist);
  }, []);

  return (
    <ul>
      { Object.entries(playlists).map(([playlistName, playlistcards]) => (
        <li>{playlistName} - {playlistcards.length}</li>
      ))}
    </ul>
  )
};

export default PlaylistList;
