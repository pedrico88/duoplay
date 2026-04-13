import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGame } from '@/lib/gameContext.jsx';
import { Sun, Moon, Trophy, Target, Gamepad2 } from 'lucide-react';
import { GAMES } from '@/lib/gameData';

export default function Profile() {
  const { profile, updateProfile, AVATARS, isDark, setIsDark } = useGame();
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const handleSave = () => {
    updateProfile({ nickname, avatar: selectedAvatar });
  };

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen pb-24 px-4">
      <div className="max-w-lg mx-auto pt-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-2xl font-bold mb-6"
        >
          👤 Mi Perfil
        </motion.h1>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-6 mb-4"
        >
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{selectedAvatar}</div>
            <p className="text-sm text-muted-foreground">Elige tu avatar</p>
          </div>
          <div className="grid grid-cols-8 gap-2 mb-6">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  selectedAvatar === emoji
                    ? 'bg-primary/20 scale-110 ring-2 ring-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nickname</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Tu nombre de jugador"
                className="mt-1 rounded-xl h-12 text-lg"
                maxLength={15}
              />
            </div>
            <Button onClick={handleSave} className="w-full rounded-xl h-12 font-display">
              Guardar
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl border border-border p-6 mb-4"
        >
          <h2 className="font-display font-bold text-lg mb-4">📊 Estadísticas</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-2xl p-4 text-center">
              <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold font-display">{profile.wins}</p>
              <p className="text-xs text-muted-foreground">Victorias</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <Target className="w-5 h-5 text-destructive mx-auto mb-1" />
              <p className="text-2xl font-bold font-display">{profile.losses}</p>
              <p className="text-xs text-muted-foreground">Derrotas</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <Gamepad2 className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold font-display">{profile.gamesPlayed}</p>
              <p className="text-xs text-muted-foreground">Partidas</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center">
              <span className="text-lg">📈</span>
              <p className="text-2xl font-bold font-display">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Per-game stats */}
        {Object.keys(profile.gameStats || {}).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-3xl border border-border p-6 mb-4"
          >
            <h2 className="font-display font-bold text-lg mb-4">🎯 Por Juego</h2>
            <div className="space-y-2">
              {Object.entries(profile.gameStats).map(([gameId, stats]) => {
                const game = GAMES.find(g => g.id === gameId);
                return (
                  <div key={gameId} className="flex items-center justify-between bg-muted rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span>{game?.emoji?.slice(0, 2) || '🎮'}</span>
                      <span className="font-medium text-sm">{game?.name || gameId}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-500 font-bold">{stats.wins}W</span>
                      <span className="text-red-500 font-bold">{stats.losses}L</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl border border-border p-6"
        >
          <h2 className="font-display font-bold text-lg mb-4">🎨 Apariencia</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDark(false)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                !isDark ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-sm font-medium">Claro</span>
            </button>
            <button
              onClick={() => setIsDark(true)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                isDark ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-sm font-medium">Oscuro</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}