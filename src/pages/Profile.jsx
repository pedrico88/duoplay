import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGame } from '@/lib/gameContext.jsx';
import { Sun, Moon, Trophy, Target, Gamepad2, Loader2, CheckCircle2 } from 'lucide-react';
import { GAMES } from '@/lib/gameData';
import PullToRefresh from '@/components/duoplay/PullToRefresh';

export default function Profile() {
  const { profile, updateProfile, AVATARS, isDark, setIsDark } = useGame();
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setSaveState('saving');
    // Optimistic update — apply immediately to context
    updateProfile({ nickname: nickname.trim(), avatar: selectedAvatar });
    // Simulate brief async persistence (localStorage is sync, but keeps the UX consistent)
    await new Promise(r => setTimeout(r, 400));
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const winRate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;

  const handleRefresh = useCallback(() => new Promise(r => setTimeout(r, 600)), []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
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
          <div className="grid grid-cols-8 gap-2 mb-6" role="radiogroup" aria-label="Seleccionar avatar">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedAvatar(emoji)}
                role="radio"
                aria-checked={selectedAvatar === emoji}
                aria-label={`Avatar ${emoji}`}
                className={`text-2xl p-2 rounded-xl transition-all min-h-[44px] min-w-[44px] ${
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
            <Button
              onClick={handleSave}
              disabled={saveState === 'saving' || !nickname.trim()}
              className={`w-full rounded-xl h-12 font-display gap-2 transition-all ${
                saveState === 'saved' ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {saveState === 'saved' && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
              {saveState === 'saving' ? 'Guardando…' : saveState === 'saved' ? '¡Guardado!' : 'Guardar'}
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
          <div className="grid grid-cols-2 gap-3" role="list" aria-label="Estadísticas">
            <div className="bg-muted rounded-2xl p-4 text-center" role="listitem">
              <Trophy className="w-5 h-5 text-accent mx-auto mb-1" aria-hidden="true" />
              <p className="text-2xl font-bold font-display">{profile.wins}</p>
              <p className="text-sm text-muted-foreground">Victorias</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center" role="listitem">
              <Target className="w-5 h-5 text-destructive mx-auto mb-1" aria-hidden="true" />
              <p className="text-2xl font-bold font-display">{profile.losses}</p>
              <p className="text-sm text-muted-foreground">Derrotas</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center" role="listitem">
              <Gamepad2 className="w-5 h-5 text-primary mx-auto mb-1" aria-hidden="true" />
              <p className="text-2xl font-bold font-display">{profile.gamesPlayed}</p>
              <p className="text-sm text-muted-foreground">Partidas</p>
            </div>
            <div className="bg-muted rounded-2xl p-4 text-center" role="listitem">
              <span className="text-lg" aria-hidden="true">📈</span>
              <p className="text-2xl font-bold font-display">{winRate}%</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
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
          <div className="flex gap-3" role="radiogroup" aria-label="Tema de la aplicación">
            <button
              onClick={() => setIsDark(false)}
              role="radio"
              aria-checked={!isDark}
              aria-label="Tema claro"
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all min-h-[44px] ${
                !isDark ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <Sun className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Claro</span>
            </button>
            <button
              onClick={() => setIsDark(true)}
              role="radio"
              aria-checked={isDark}
              aria-label="Tema oscuro"
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all min-h-[44px] ${
                isDark ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <Moon className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Oscuro</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
    </PullToRefresh>
  );
}