import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function GameCard({ game, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <Link
        to={`/play/${game.id}`}
        className="block"
        aria-label={`Jugar ${game.name}: ${game.description}`}
      >
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${game.color} p-4 h-36 flex flex-col justify-between shadow-lg transform transition-transform`}>
          {/* Background decoration */}
          <div className="absolute bottom-2 right-2 text-5xl opacity-20 select-none">
            {game.emoji}
          </div>
          <div className="flex items-start gap-2">
            <span className="text-2xl">{game.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-display font-bold text-base leading-tight">
                {game.name}
              </h3>
              <p className="text-white/70 text-xs mt-0.5 line-clamp-2">
                {game.description}
              </p>
            </div>
          </div>
          <div>
            <span className="text-white/60 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              {game.players}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}