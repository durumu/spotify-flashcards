import React, { useState, useEffect } from 'react';

const FlashCard = ({ track, isPlaying, onPlay, onNext }) => {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    // First flip the card back
    setRevealed(false);

    // Then wait for the animation to complete before moving to next track
    setTimeout(() => {
      // This will trigger the App's nextTrack function which stops playback
      onNext();
    }, 600); // Match this to the CSS transition duration
  };

  // Handle spacebar key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if spacebar was pressed
      if (event.code === 'Space' || event.keyCode === 32) {
        // Prevent default spacebar behavior (page scrolling)
        event.preventDefault();

        // Logic for spacebar actions:
        // 1. If song is not playing and card is not revealed -> Play
        // 2. If card is not revealed (regardless of playing) -> Reveal
        // 3. If card is revealed -> Next song

        if (revealed) {
          // Card is revealed, go to next
          handleNext();
        } else if (!isPlaying) {
          // Card is not revealed and no song is playing, play clip
          onPlay();
        } else {
          // Song is playing but card is not revealed, reveal card
          handleReveal();
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [revealed, isPlaying, onPlay, onNext]); // Dependencies for useEffect

  // Handle click on the card
  const handleCardClick = () => {
    // Follow the same logic as spacebar
    if (revealed) {
      // Card is revealed, go to next
      handleNext();
    } else if (!isPlaying) {
      // Card is not revealed and no song is playing, play clip
      onPlay();
    } else {
      // Song is playing but card is not revealed, reveal card
      handleReveal();
    }
  };

  return (
    <div className={`flash-card ${revealed ? 'revealed' : ''}`}>
      <div className="card-front" onClick={handleCardClick}>
        <div className="card-question">
          <h3>What song is this?</h3>
          <div className="card-actions">
            <button
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering card click
                onPlay();
              }}
              disabled={isPlaying}
            >
              {isPlaying ? 'Playing...' : 'Play Clip'}
            </button>
            <button
              className="reveal-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering card click
                handleReveal();
              }}
            >
              Reveal
            </button>
          </div>
          <div className="card-hint">
            <p>Click anywhere on card or press spacebar</p>
          </div>
        </div>
      </div>

      <div className="card-back" onClick={handleCardClick}>
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
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering card click
            handleNext();
          }}
        >
          Next Song
        </button>
        <div className="card-hint">
          <p>Click anywhere or press spacebar for next song</p>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
