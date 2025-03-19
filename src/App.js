// App.js - Main component for the Spotify Flashcards app

import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import FlashCard from './components/FlashCard';
import PlaylistSelector from './components/PlaylistSelector';

function App() {
  const [token, setToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Check for token in URL fragment after Spotify auth redirect
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        if (item) {
          const parts = item.split('=');
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});

    if (hash.access_token) {
      setToken(hash.access_token);
      window.location.hash = '';
      window.localStorage.setItem('spotify_token', hash.access_token);
    } else {
      const storedToken = window.localStorage.getItem('spotify_token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchPlaylists();
      initializePlayer();
    }
  }, [token]);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchTracks(selectedPlaylist.id);
    }
  }, [selectedPlaylist]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token expired
        window.localStorage.removeItem('spotify_token');
        setToken('');
        return;
      }

      const data = await response.json();
      setPlaylists(data.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchTracks = async (playlistId) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      // Filter out any items with null track (can happen with podcasts, etc.)
      const validTracks = data.items.filter(item => item.track);

      // Shuffle the tracks
      const shuffledTracks = validTracks
        .sort(() => Math.random() - 0.5);

      setTracks(shuffledTracks);
      setCurrentTrackIndex(0);

      if (player) {
        player.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const initializePlayer = () => {
    // Load Spotify Web Playback SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Music Trivia Flash Cards',
        getOAuthToken: cb => { cb(token); }
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
      });
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
        window.localStorage.removeItem('spotify_token');
        setToken('');
      });
      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
      });
      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
      });

      // Connect to the player
      spotifyPlayer.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      });

      setPlayer(spotifyPlayer);
    };
  };

  const playCurrentTrack = async () => {
    if (!tracks.length || currentTrackIndex >= tracks.length) return;

    const currentTrack = tracks[currentTrackIndex].track;

    try {
      // Get track details to find total duration
      const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${currentTrack.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const trackData = await trackResponse.json();
      const durationMs = trackData.duration_ms;

      const playLengthMs = 15000;

      // Play from the middle of the song for a few seconds
      const startPositionMs = Math.max(0, Math.floor(durationMs / 2) - playLengthMs);

      // Get user's available devices
      const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const devicesData = await devicesResponse.json();
      const webPlayerDevice = devicesData.devices.find(device =>
        device.name === 'Music Trivia Flash Cards');

      if (webPlayerDevice) {
        // Play on our Web Playback SDK instance
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${webPlayerDevice.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: [currentTrack.uri],
            position_ms: startPositionMs
          })
        });

        setIsPlaying(true);

        // Stop after playing for the duration
        setTimeout(() => {
          if (player) {
            player.pause();
            setIsPlaying(false);
          }
        }, playLengthMs);
      } else {
        console.error('Web player device not found');
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const nextTrack = () => {
    // First, stop the current playback completely
    if (player && isPlaying) {
      player.pause();

      // Reset the Spotify playback state completely
      fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => console.error('Error stopping playback:', error));
    }

    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
    setIsPlaying(false);
  };

  const logout = () => {
    window.localStorage.removeItem('spotify_token');
    setToken('');
    setPlaylists([]);
    setSelectedPlaylist(null);
    setTracks([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Music Trivia Flash Cards</h1>
        {token ? (
          <button className="logout-button" onClick={logout}>Logout</button>
        ) : null}
      </header>

      {!token ? (
        <Login />
      ) : (
        <div className="container">
          {!selectedPlaylist ? (
            <PlaylistSelector
              playlists={playlists}
              onSelectPlaylist={setSelectedPlaylist}
            />
          ) : (
            <div className="game-area">
              <h2>Flash Cards from: {selectedPlaylist.name}</h2>
              {tracks.length > 0 && currentTrackIndex < tracks.length ? (
                <FlashCard
                  track={tracks[currentTrackIndex].track}
                  isPlaying={isPlaying}
                  onPlay={playCurrentTrack}
                  onNext={nextTrack}
                />
              ) : (
                <div className="loading">Loading tracks...</div>
              )}
              <button
                className="back-button"
                onClick={() => setSelectedPlaylist(null)}
              >
                Back to Playlists
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
