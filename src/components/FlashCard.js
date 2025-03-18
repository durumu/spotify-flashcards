// components/FlashCard.js
import React, { useState } from 'react';

const FlashCard = ({ track, isPlaying, onPlay, onNext }) => {
  const [revealed, setRevealed] = useState(false);
  
  const handleReveal = () => {
    setRevealed(true);
  };
  
  const handleNext = () => {
    setRevealed(false);
    onNext();
  };

  return (
    <div className={`flash-card ${revealed ? 'revealed' : ''}`}>
      <div className="card-front">
        <div className="card-question">
          <h3>What song is this?</h3>
          <button 
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={onPlay}
            disabled={isPlaying}
          >
            {isPlaying ? 'Playing...' : 'Play Clip'}
          </button>
          <button 
            className="reveal-button"
            onClick={handleReveal}
          >
            Reveal
          </button>
        </div>
      </div>
      
      <div className="card-back">
        <div className="track-info">
          {track.album.images && track.album.images.length > 0 && (
            <img 
              className="album-image" 
              src={track.album.images[0].url} 
              alt={`${track.album.name} cover`} 
            />
          )}
          <h3 className="track-name">{track.name}</h3>
          <p className="track-artist">
            {track.artists.map(artist => artist.name).join(', ')}
          </p>
          <p className="track-album">{track.album.name}</p>
        </div>
        <button 
          className="next-button"
          onClick={handleNext}
        >
          Next Song
        </button>
      </div>
    </div>
  );
};

export default FlashCard;
