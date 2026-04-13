import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GAMES, CATEGORIES } from '@/lib/gameData';
import GameCard from '@/components/duoplay/GameCard';

export default function Games() {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? GAMES : GAMES.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold"
        >
          🎮 Juegos
        </motion.h1>
        <p className="text-muted-foreground text-sm mt-1">2 jugadores · mismo móvil</p>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </div>
  );
}