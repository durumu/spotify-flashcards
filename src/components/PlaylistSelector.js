// components/PlaylistSelector.js
import React from 'react';

const PlaylistSelector = ({ playlists, onSelectPlaylist }) => {
  return (
    <div className="playlist-selector">
      <h2>Select a Playlist</h2>
      <div className="playlists-grid">
        {playlists.map(playlist => (
          <div 
            key={playlist.id} 
            className="playlist-item"
            onClick={() => onSelectPlaylist(playlist)}
          >
            <div className="playlist-image">
              {playlist.images && playlist.images.length > 0 ? (
                <img 
                  src={playlist.images[0].url} 
                  alt={`${playlist.name} cover`} 
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>
            <div className="playlist-name">{playlist.name}</div>
            <div className="playlist-tracks">{playlist.tracks.total} tracks</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistSelector;

