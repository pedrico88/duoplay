import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function GameCard({ game, index, mode = 'local' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/play/${game.id}?mode=${mode}`}
        className="block"
      >
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${game.color} p-4 h-32 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow active:scale-[0.97] transform`}>
          <div className="absolute top-2 right-2 text-3xl opacity-80">
            {game.emoji}
          </div>
          <div>
            <h3 className="text-white font-display font-bold text-lg leading-tight">
              {game.name}
            </h3>
            <p className="text-white/70 text-xs mt-0.5 line-clamp-2">
              {game.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white/60 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              {game.players}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}