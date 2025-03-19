import React from 'react';

const Login = () => {
  const clientId = 'bd6f8086d4b8405d8e47e62096e7dc7d';
  const redirectUri = window.location.origin;
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(
      scopes.join(' ')
    )}&response_type=token&show_dialog=true`;

    window.location.href = authUrl;
  };

  return (
    <div className="login-container">
      <h2>Welcome to Spotify Music Trivia Flash Cards</h2>
      <p>Test your music knowledge with your Spotify playlists!</p>
      <button onClick={handleLogin} className="login-button">
        Connect with Spotify
      </button>
      <div className="login-info">
        <p>This app will:</p>
        <ul>
          <li>Access your Spotify playlists</li>
          <li>Play short clips from songs</li>
          <li>Create music trivia flash cards</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;

