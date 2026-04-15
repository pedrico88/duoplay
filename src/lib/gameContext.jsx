import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext(null);

const AVATARS = ['😎', '🤖', '👾', '🦊', '🐉', '🦁', '🐱', '🐼', '🦄', '👻', '🎃', '🤠', '🥷', '🧙', '🦸', '🧛'];

const DEFAULT_PROFILE = { nickname: '', avatar: '😎', wins: 0, losses: 0, gamesPlayed: 0, gameStats: {} };

function safeLocalStorageGet(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function GameProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = safeLocalStorageGet('duoplay_profile', DEFAULT_PROFILE);
    // Ensure all expected keys exist (migration safety)
    return { ...DEFAULT_PROFILE, ...saved, gameStats: saved.gameStats || {} };
  });

  const [isDark, setIsDark] = useState(() => {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [sessionScore, setSessionScore] = useState({ player1: 0, player2: 0 });
  const [tournament, setTournament] = useState(null);

  const startTournament = (gameIds) => {
    setTournament({ games: gameIds, currentIndex: 0, scores: { player1: 0, player2: 0 } });
  };

  const advanceTournament = (winnerPlayer) => {
    setTournament(prev => {
      if (!prev) return null;
      const newScores = { ...prev.scores };
      if (winnerPlayer === 'player1') newScores.player1 += 1;
      else if (winnerPlayer === 'player2') newScores.player2 += 1;
      return { ...prev, currentIndex: prev.currentIndex + 1, scores: newScores };
    });
  };

  const endTournament = () => setTournament(null);

  useEffect(() => {
    safeLocalStorageSet('duoplay_profile', profile);
  }, [profile]);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', isDark);
    } catch {}
  }, [isDark]);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setIsDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } catch {}
  }, []);

  const updateProfile = (updates) => setProfile(prev => ({ ...prev, ...updates }));

  const recordWin = (game) => {
    setProfile(prev => ({
      ...prev,
      wins: (prev.wins || 0) + 1,
      gamesPlayed: (prev.gamesPlayed || 0) + 1,
      gameStats: {
        ...prev.gameStats,
        [game]: {
          wins: ((prev.gameStats?.[game]?.wins) || 0) + 1,
          losses: (prev.gameStats?.[game]?.losses) || 0,
        },
      },
    }));
  };

  const recordLoss = (game) => {
    setProfile(prev => ({
      ...prev,
      losses: (prev.losses || 0) + 1,
      gamesPlayed: (prev.gamesPlayed || 0) + 1,
      gameStats: {
        ...prev.gameStats,
        [game]: {
          wins: (prev.gameStats?.[game]?.wins) || 0,
          losses: ((prev.gameStats?.[game]?.losses) || 0) + 1,
        },
      },
    }));
  };

  return (
    <GameContext.Provider value={{
      profile, updateProfile, recordWin, recordLoss,
      isDark, setIsDark,
      sessionScore, setSessionScore,
      tournament, startTournament, advanceTournament, endTournament,
      AVATARS,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}