import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/lib/gameContext.jsx';

export default function Home() {
  const { profile, isDark, setIsDark } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-4 right-4 p-2 rounded-full bg-card border border-border z-10"
      >
        {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-sm w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-7xl mb-4">🎮</div>
          <h1 className="font-display text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            DúoPlay
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Juegos para 2 jugadores · mismo móvil
          </p>
        </motion.div>

        {/* Welcome */}
        {profile.nickname && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg mb-8"
          >
            ¡Hola, <span className="font-bold">{profile.avatar} {profile.nickname}</span>!
          </motion.p>
        )}

        {/* Main Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          <Link to="/games">
            <Button className="w-full h-16 rounded-2xl text-lg font-display font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25 gap-3">
              🕹️ ¡Jugar ahora!
            </Button>
          </Link>
          <Link to="/tournament">
            <Button variant="outline" className="w-full h-12 rounded-2xl font-display font-bold border-2 border-accent text-accent hover:bg-accent hover:text-white gap-2">
              <Trophy className="w-4 h-4" />
              Modo Torneo
            </Button>
          </Link>
        </motion.div>

        {/* Quick Stats */}
        {profile.gamesPlayed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-3"
          >
            <div className="bg-card rounded-2xl p-3 border border-border">
              <p className="text-2xl font-bold font-display text-primary">{profile.wins}</p>
              <p className="text-[10px] text-muted-foreground">Victorias</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border">
              <p className="text-2xl font-bold font-display">{profile.gamesPlayed}</p>
              <p className="text-[10px] text-muted-foreground">Partidas</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border">
              <p className="text-2xl font-bold font-display text-accent">
                {profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0}%
              </p>
              <p className="text-[10px] text-muted-foreground">Win Rate</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}