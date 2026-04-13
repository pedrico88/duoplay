import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronRight, X } from 'lucide-react';

const WINNER_LABELS = { player1: 'Jugador 1', player2: 'Jugador 2', draw: 'Empate' };

export default function TournamentBanner({ winner, currentIndex, totalGames, scores, isLast, onNext, onAbort }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl"
      >
        {/* Tournament progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-accent">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Torneo</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Juego {currentIndex}/{totalGames}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-5">
          {Array.from({ length: totalGames }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < currentIndex ? 'bg-primary flex-1' : 'bg-muted flex-1'
              }`}
            />
          ))}
        </div>

        {/* Round result */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">{winner === 'draw' ? '🤝' : '🏆'}</div>
          <h3 className="font-display text-xl font-bold">
            {winner === 'draw' ? '¡Empate!' : `¡Gana ${WINNER_LABELS[winner]}!`}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">en esta ronda</p>
        </div>

        {/* Accumulated scores */}
        <div className="flex gap-3 mb-5">
          <div className={`flex-1 rounded-2xl p-3 text-center border-2 transition-colors ${
            scores.player1 > scores.player2 ? 'border-primary bg-primary/5' : 'border-border bg-muted/50'
          }`}>
            <p className="font-display text-2xl font-bold text-primary">{scores.player1}</p>
            <p className="text-xs text-muted-foreground">Jugador 1</p>
          </div>
          <div className="flex items-center text-muted-foreground text-sm font-bold">VS</div>
          <div className={`flex-1 rounded-2xl p-3 text-center border-2 transition-colors ${
            scores.player2 > scores.player1 ? 'border-secondary bg-secondary/5' : 'border-border bg-muted/50'
          }`}>
            <p className="font-display text-2xl font-bold text-secondary">{scores.player2}</p>
            <p className="text-xs text-muted-foreground">Jugador 2</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onAbort} className="rounded-xl gap-1">
            <X className="w-4 h-4" /> Salir
          </Button>
          <Button onClick={onNext} className="flex-1 rounded-xl bg-primary gap-2 font-display font-bold">
            {isLast ? (
              <><Trophy className="w-4 h-4" /> Ver resultados</>
            ) : (
              <>Siguiente juego <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}