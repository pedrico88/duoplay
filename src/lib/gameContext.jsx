import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext(null);

const AVATARS = ['😎', '🤖', '👾', '🦊', '🐉', '🦁', '🐱', '🐼', '🦄', '👻', '🎃', '🤠', '🥷', '🧙', '🦸', '🧛'];

export function GameProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('duoplay_profile');
    return saved ? JSON.parse(saved) : { nickname: '', avatar: '😎', wins: 0, losses: 0, gamesPlayed: 0, gameStats: {} };
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [sessionScore, setSessionScore] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    localStorage.setItem('duoplay_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const updateProfile = (updates) => setProfile(prev => ({ ...prev, ...updates }));
  
  const recordWin = (game) => {
    setProfile(prev => ({
      ...prev,
      wins: prev.wins + 1,
      gamesPlayed: prev.gamesPlayed + 1,
      gameStats: {
        ...prev.gameStats,
        [game]: { wins: (prev.gameStats?.[game]?.wins || 0) + 1, losses: prev.gameStats?.[game]?.losses || 0 }
      }
    }));
  };

  const recordLoss = (game) => {
    setProfile(prev => ({
      ...prev,
      losses: prev.losses + 1,
      gamesPlayed: prev.gamesPlayed + 1,
      gameStats: {
        ...prev.gameStats,
        [game]: { wins: prev.gameStats?.[game]?.wins || 0, losses: (prev.gameStats?.[game]?.losses || 0) + 1 }
      }
    }));
  };

  return (
    <GameContext.Provider value={{
      profile, updateProfile, recordWin, recordLoss,
      isDark, setIsDark,
      sessionScore, setSessionScore,
      AVATARS
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}