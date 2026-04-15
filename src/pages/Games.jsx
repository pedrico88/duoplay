import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { GAMES } from '@/lib/gameData';
import GameCard from '@/components/duoplay/GameCard';
import PullToRefresh from '@/components/duoplay/PullToRefresh';
import CategoryPicker from '@/components/duoplay/CategoryPicker';

export default function Games() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = useMemo(
    () => activeCategory === 'all' ? GAMES : GAMES.filter(g => g.category === activeCategory),
    [activeCategory]
  );

  const handleRefresh = useCallback(() => new Promise(r => setTimeout(r, 600)), []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold">🎮 Juegos</h1>
            <p className="text-muted-foreground text-sm mt-1">2 jugadores · mismo móvil</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Link
              to="/tournament"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-accent to-primary text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
            >
              <Trophy className="w-3.5 h-3.5" />
              Torneo
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4">
        <CategoryPicker activeCategory={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Games Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </div>
    </PullToRefresh>
  );
}